import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session

from api.database import SessionLocal
from api.models import Route, JobLog
from api.services.amadeus import amadeus_service
from api.services.alerts import alert_service
from api.routers.prices import create_price
from api.schemas import PriceCreate
from config import settings

logger = logging.getLogger(__name__)


class JobScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.is_running = False

    def start(self):
        """Inicia o scheduler"""
        if not self.is_running:
            # Adicionar job principal
            self.scheduler.add_job(
                func=self.price_monitoring_job,
                trigger=IntervalTrigger(
                    hours=settings.job_interval_hours,
                    jitter=settings.job_jitter_seconds,
                ),
                id="price_monitoring",
                name="Price Monitoring Job",
                replace_existing=True,
                next_run_time=datetime.now()
                + timedelta(seconds=30),  # Primeira execução em 30s
            )

            self.scheduler.start()
            self.is_running = True
            logger.info("Scheduler iniciado com sucesso")

    def stop(self):
        """Para o scheduler"""
        if self.is_running:
            self.scheduler.shutdown()
            self.is_running = False
            logger.info("Scheduler parado")

    def price_monitoring_job(self):
        """
        Job principal de monitoramento de preços
        """
        db = SessionLocal()
        job_log = None

        try:
            # Criar log do job
            job_log = JobLog(started_at=datetime.now())
            db.add(job_log)
            db.commit()
            db.refresh(job_log)

            logger.info(f"Iniciando job de monitoramento (ID: {job_log.id})")

            routes_processed = 0
            prices_found = 0
            deals_found = 0

            if not amadeus_service.is_client_ready():
                raise Exception("Cliente Amadeus não está pronto")

            # Buscar rotas ativas
            routes = db.query(Route).filter(Route.active == True).all()
            logger.info(f"Processando {len(routes)} rotas ativas")

            for route in routes:
                try:
                    routes_processed += 1
                    logger.info(
                        f"Processando rota #{route.id}: {route.origin} → {route.dest}"
                    )

                    # Processar cada dia da rota
                    current_day = route.start
                    while current_day <= route.end:
                        try:
                            # Buscar preço na API
                            price = amadeus_service.get_cheapest_price(
                                current_day, route.origin, route.dest
                            )

                            if price:
                                prices_found += 1

                                # Salvar preço no banco
                                price_data = PriceCreate(
                                    route_id=route.id, day=current_day, value=price
                                )

                                # Usar a função do router para salvar
                                saved_price = create_price(price_data, db)

                                logger.debug(
                                    f"Preço salvo: {current_day} = R$ {price:.2f}"
                                )

                                # Verificar se é uma promoção
                                if alert_service.is_deal(
                                    db, route.id, current_day, price
                                ):
                                    deals_found += 1
                                    logger.info(
                                        f"DEAL encontrado: {current_day} = R$ {price:.2f}"
                                    )
                                    alert_service.handle_deal(
                                        db, route, current_day, price
                                    )

                            else:
                                logger.debug(
                                    f"Nenhum preço encontrado para {current_day}"
                                )

                        except Exception as e:
                            logger.error(
                                f"Erro ao processar {current_day} da rota #{route.id}: {e}"
                            )

                        # Próximo dia
                        current_day += timedelta(days=1)

                except Exception as e:
                    logger.error(f"Erro ao processar rota #{route.id}: {e}")

            # Atualizar log do job
            job_log.finished_at = datetime.now()
            job_log.routes_processed = routes_processed
            job_log.prices_found = prices_found
            job_log.deals_found = deals_found
            job_log.success = True

            logger.info(
                f"Job concluído: {routes_processed} rotas, {prices_found} preços, {deals_found} deals"
            )

        except Exception as e:
            logger.error(f"Erro crítico no job: {e}")

            if job_log:
                job_log.finished_at = datetime.now()
                job_log.success = False
                job_log.error_message = str(e)[:500]  # Limitar tamanho da mensagem

        finally:
            if job_log:
                db.commit()
            db.close()

    def get_status(self):
        """Retorna status do scheduler"""
        return {
            "running": self.is_running,
            "jobs": (
                [
                    {
                        "id": job.id,
                        "name": job.name,
                        "next_run": (
                            job.next_run_time.isoformat() if job.next_run_time else None
                        ),
                    }
                    for job in self.scheduler.get_jobs()
                ]
                if self.is_running
                else []
            ),
        }


# Instância global do scheduler
job_scheduler = JobScheduler()


def start_scheduler():
    """Função para iniciar o scheduler"""
    job_scheduler.start()


def stop_scheduler():
    """Função para parar o scheduler"""
    job_scheduler.stop()

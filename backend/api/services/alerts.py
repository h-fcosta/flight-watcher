from datetime import datetime, timedelta
import logging
from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session

from api.models import Route, Price, JobLog
from api.schemas import Deal
from api.services.amadeus import amadeus_service
from api.services.telegram import telegram_service
from config import settings

logger = logging.getLogger(__name__)


class AlertService:
    def __init__(self):
        self.deal_threshold = settings.deal_threshold_percent / 100.0

    def is_deal(
        self, db: Session, route_id: int, day: datetime.date, price: float
    ) -> bool:
        """
        Verifica se um preço é considerado uma promoção
        """
        # Buscar média de preços para esta rota
        avg_query = db.query(func.avg(Price.value)).filter(Price.route_id == route_id)

        avg_price = avg_query.scalar()

        if not avg_price:
            # Se não há histórico, considerar qualquer preço como normal
            return False

        # Verificar se o preço atual está X% abaixo da média
        discount_threshold = avg_price * (1 - self.deal_threshold)

        logger.debug(
            f"Verificando deal: preço={price:.2f}, média={avg_price:.2f}, "
            f"threshold={discount_threshold:.2f}"
        )

        return price < discount_threshold

    def get_deal_info(self, db: Session, route_id: int, price: float) -> dict:
        """
        Retorna informações detalhadas sobre uma promoção
        """
        avg_query = db.query(func.avg(Price.value)).filter(Price.route_id == route_id)

        avg_price = avg_query.scalar() or price
        discount_percent = (
            ((avg_price - price) / avg_price) * 100 if avg_price > 0 else 0
        )

        return {
            "average_price": avg_price,
            "discount_percent": discount_percent,
            "savings": avg_price - price,
        }

    def handle_deal(
        self, db: Session, route: Route, day: datetime.date, price: float
    ) -> None:
        """
        Processa uma promoção encontrada
        """
        deal_info = self.get_deal_info(db, route.id, price)

        message = (
            f"🎉 *PROMOÇÃO ENCONTRADA!*\n\n"
            f"✈️ *Rota:* {route.origin} → {route.dest}\n"
            f"📅 *Data:* {day.strftime('%d/%m/%Y')}\n"
            f"💰 *Preço:* R$ {price:,.2f}\n"
            f"📊 *Média:* R$ {deal_info['average_price']:,.2f}\n"
            f"💸 *Economia:* R$ {deal_info['savings']:,.2f} "
            f"({deal_info['discount_percent']:.1f}%)"
        )

        logger.info(
            f"DEAL encontrado: {route.origin}-{route.dest} em {day} por R$ {price:.2f}"
        )

        # Enviar notificação via Telegram
        telegram_service.send_message(message)

    def get_recent_deals(
        self, db: Session, days: int = 30, limit: int = 50
    ) -> List[Deal]:
        """
        Retorna as promoções encontradas nos últimos X dias
        """
        cutoff_date = datetime.now().date() - timedelta(days=days)

        # Buscar preços recentes com suas médias
        deals = []

        prices_query = (
            db.query(Price)
            .join(Route)
            .filter(Price.day >= cutoff_date)
            .order_by(Price.created_at.desc())
            .limit(limit * 2)  # Buscar mais para filtrar os deals
        )

        for price in prices_query:
            if self.is_deal(db, price.route_id, price.day, price.value):
                deal_info = self.get_deal_info(db, price.route_id, price.value)

                deal = Deal(
                    route=price.route,
                    day=price.day,
                    price=price.value,
                    average_price=deal_info["average_price"],
                    discount_percent=deal_info["discount_percent"],
                )

                deals.append(deal)

                if len(deals) >= limit:
                    break

        return deals


# Instância global do serviço
alert_service = AlertService()

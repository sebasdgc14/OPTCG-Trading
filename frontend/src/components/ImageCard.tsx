import React from "react";
import type { Card } from "../types/card";

const ImageCard: React.FC<{ card: Card; onOpen: (c: Card) => void }> = ({
  card,
  onOpen,
}) => {
  const img = card.unique_img_link || "/default-card.png";

  return (
    <div
      className="image-card"
      onClick={() => onOpen(card)}
      aria-label={card.name}
    >
      <img src={img} alt={card.unique_id} loading="lazy" />
      <div className="overlay">
        <div className="overlay-text">
          <strong>{card.name}</strong>
          <div className="rarity">{card.rarity}</div>
          <div className="id">{card.card_id}</div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;

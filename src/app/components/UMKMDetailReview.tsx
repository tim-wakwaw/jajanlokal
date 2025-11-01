import React from 'react';
import { UMKM } from './UMKMDetailCard'; 

interface Props {
  umkm: UMKM;
}

const UMKMDetailReview: React.FC<Props> = ({ umkm }) => {
  const getAvatar = (name: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-semibold text-foreground mb-0">
        Ulasan Pelanggan ({umkm.comments.length})
      </h4>
      {umkm.comments.length > 0 ? (
        umkm.comments.map((comment, index) => (
          <div key={index} className="flex items-start gap-3 border-b border-border pb-3 last:border-b-0">
            <img
              src={getAvatar(comment.user)}
              alt={comment.user}
              className="w-8 h-8 rounded-full bg-muted border"
            />
            <div className="flex-1">
              <strong className="text-sm font-medium text-foreground">{comment.user}</strong>
              <p className="text-sm text-foreground/80 mt-1">{comment.text}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Belum ada ulasan untuk UMKM ini.
        </p>
      )}
    </div>
  );
};

export default UMKMDetailReview;
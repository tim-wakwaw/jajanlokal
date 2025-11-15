import React from 'react';
import Image from 'next/image';
import { UMKM } from './UMKMDetailCard'; 

interface Props {
  umkm: UMKM;
}

const getAvatar = (username: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;

const UMKMDetailReview: React.FC<Props> = ({ umkm }) => {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-semibold text-foreground mb-0">
        Ulasan Pelanggan ({umkm.comments.length})
      </h4>
      {umkm.comments.length > 0 ? (
        umkm.comments.map((comment, index) => (
          <div key={index} className="flex items-start gap-3 border-b border-border pb-3 last:border-b-0">
            <Image
              src={getAvatar(comment.user)}
              alt={comment.user}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full bg-muted border border-primary"
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
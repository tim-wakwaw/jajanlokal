import React from 'react';
import { IconMapPin } from '@tabler/icons-react';
import { UMKM } from './UMKMDetailCard'; 

interface Props {
  umkm: UMKM;
}

const UMKMDetailOverview: React.FC<Props> = ({ umkm }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Alamat */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-1">Alamat</h4>
        <div className="flex items-start gap-1.5">
          <IconMapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            {umkm.alamat}
          </p>
        </div>
      </div>

      {/* Deskripsi */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-1">Deskripsi</h4>
        <p className="text-sm text-foreground/80">{umkm.description}</p>
      </div>
    </div>
  );
};

export default UMKMDetailOverview;
import { useEffect, useState } from 'react';

import { useModel } from '../../store/models';
import { DEFAULT_GEOMETRY_SETTINGS, type GeometrySettings } from '../../types/geometry';
import GeometryPanel from './panels/GeometryPanel';
import type { Materiau } from '../../types/material';
import useCalculs from '../../hooks/useCalculs';
import MaterialPanel from './panels/MaterialPanel';
import SupportPanel from './panels/SupportPanel';
import MeshPanel from './panels/MeshPanel';
import { useWorkState } from '../../store/modules';

export default function Rightbar() {
  const { getMateriaux } = useCalculs()
  const WorkState = useWorkState((p)=>p)
  


  useEffect(() => {
    getMateriaux()
  }, [])

  const model = useModel((s) => s);
  console.log(model)


  const renderPanel = () => {
    switch (WorkState.currentWorkState) {
      case 'geometry':
        return (
          <GeometryPanel/>
        );

      case 'material':
        return (
          <MaterialPanel/>
        );
      case 'support':
        return (
          <SupportPanel/>
        );
      case 'mesh':
        return (
          <MeshPanel/>
        );
      default:
        return <div className="p-4">Sélectionnez une étape</div>;
    }
  };

  return (
    <div className="w-80 h-full shrink-0 bg-amber-900 text-white border-l border-amber-950 overflow-hidden">
      {renderPanel()}
    </div>
  );
}

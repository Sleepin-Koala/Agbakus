import { useEffect, useState } from 'react';

import { useModel } from '../../store/models';
import { DEFAULT_GEOMETRY_SETTINGS, type GeometrySettings } from '../../types/geometry';
import type { CurrentWorkState, RightbarProps } from '../types';
import GeometryPanel from './panels/GeometryPanel';
import type { Material } from 'three';
import type { Materiau } from '../../types/material';
import useCalculs from '../../hooks/useCalculs';
import MaterialPanel from './panels/MaterialPanel';
import SupportPanel from './panels/SupportPanel';
import MeshPanel from './panels/MeshPanel';

export default function Rightbar({ currentWorkState }: { currentWorkState: CurrentWorkState }) {
  const [geometrySettings, setGeometrySettings] = useState<GeometrySettings>(DEFAULT_GEOMETRY_SETTINGS);
  const [materialSettings, setMaterialSettings] = useState<Materiau | null>(null);
  // const [meshSettings, setMeshSettings] = useState<MeshSettings>(DEFAULT_MESH_SETTINGS);
  // const [supportSettings, setSupportSettings] = useState<SupportSettings>(DEFAULT_SUPPORT_SETTINGS);

  const { getMateriaux } = useCalculs()


  useEffect(() => {
    getMateriaux()
  }, [])

  const model = useModel((s) => s);


  const renderPanel = () => {
    switch (currentWorkState) {
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

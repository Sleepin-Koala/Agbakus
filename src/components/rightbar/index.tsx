import { useEffect } from 'react';

import GeometryPanel from './panels/GeometryPanel';
import useCalculs from '../../hooks/useCalculs';
import MaterialPanel from './panels/MaterialPanel';
import SupportPanel from './panels/SupportPanel';
import { useWorkState } from '../../store/modules';
import JobPanel from './panels/JobPanel';
import LoadPanel from './panels/LoadPanel/LoadPanel';
import MeshPanel from './panels/MeshPanel';



export default function Rightbar() {
  const { getMateriaux } = useCalculs()
  const WorkState = useWorkState((p)=>p)

  useEffect(() => {
    getMateriaux()
  }, [])

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
      case 'job':
        return (
          <JobPanel/>
        );
      case 'load':
        return (
          <LoadPanel/>
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

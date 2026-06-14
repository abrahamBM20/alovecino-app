import { useLocalSearchParams } from 'expo-router';
import CrearConsultaScreen from '../../../../../features/consultas/screens/CrearConsultaScreen';

export default function NuevaConsultaRoute() {
  const { id, nombre } = useLocalSearchParams();
  return <CrearConsultaScreen idAlmacen={id} nombreAlmacen={nombre} />;
}

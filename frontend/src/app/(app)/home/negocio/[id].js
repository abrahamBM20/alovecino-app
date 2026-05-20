import { useLocalSearchParams } from 'expo-router';
import NegocioDetailScreen from '../../../../features/valoracion/screens/NegocioDetailScreen';

export default function BusinessDetailRoute() {
  const { id, nombre, comuna, region, distancia } = useLocalSearchParams();
  return (
    <NegocioDetailScreen
      id={id}
      nombre={nombre}
      comuna={comuna}
      region={region}
      distancia={distancia}
    />
  );
}

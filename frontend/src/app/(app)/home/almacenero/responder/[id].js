import { useLocalSearchParams } from 'expo-router';
import ResponderConsultaScreen from '../../../../../features/almacenero/screens/ResponderConsultaScreen';

export default function ResponderConsultaRoute() {
  const { id, pregunta, cantidad, cliente, fecha } = useLocalSearchParams();
  return (
    <ResponderConsultaScreen
      idConsulta={id}
      pregunta={pregunta}
      cantidad={cantidad}
      cliente={cliente}
      fecha={fecha}
    />
  );
}

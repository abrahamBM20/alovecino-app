import { useLocalSearchParams } from 'expo-router';
import ChatMinimarketScreen from '../../../../features/chat/screens/ChatMinimarketScreen';

export default function ChatRoute() {
  const { id, nombre, logoUrl } = useLocalSearchParams();
  return <ChatMinimarketScreen idAlmacen={id} nombre={nombre} logoUrl={logoUrl} />;
}

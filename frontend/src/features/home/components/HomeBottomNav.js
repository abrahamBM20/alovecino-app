import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors } from '../../../theme/colors';

const NAV_ITEMS = [
  { id: 'filtro', source: require('../../../../assets/boton_filtro.png'), label: 'Filtro' },
  { id: 'inicio', source: require('../../../../assets/boton_inicio.png'), label: 'Inicio' },
  { id: 'configuracion', source: require('../../../../assets/boton_configuracion.png'), label: 'Configuración' },
  { id: 'perfil', source: require('../../../../assets/boton_perfil.png'), label: 'Perfil' },
];

export default function HomeBottomNav({ onNavigate }) {
  return (
    <View style={styles.barContainer}>
      {NAV_ITEMS.map(({ id, source, label }) => (
        <TouchableOpacity
          key={id}
          style={styles.tabButton}
          activeOpacity={0.8}
          onPress={() => onNavigate?.(id)}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          <Image source={source} style={styles.tabImage} resizeMode="contain" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    height: 87,
    backgroundColor: '#044e81',
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(26,86,219,0.12)',
    shadowColor: colors.bgDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  tabButton: {
    width: 63,
    height: 63,
    borderRadius: 31.5,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabImage: {
    width: 60,
    height: 60,
  },
});

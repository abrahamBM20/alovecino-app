import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function HomeRoute() {
  const status = useAuthStore((state) => state.status);
  const [HomeScreen, setHomeScreen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    let isMounted = true;
    import('../../features/home/screens/HomeScreen')
      .then((module) => {
        if (isMounted) {
          setHomeScreen(() => module.default);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [status]);

  if (status !== 'authenticated') {
    return <Redirect href="/auth" />;
  }

  if (loading || !HomeScreen) {
    return null;
  }

  return <HomeScreen />;
}

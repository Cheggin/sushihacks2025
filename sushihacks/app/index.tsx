import React from 'react';
import { LandingScreen } from '../screens/LandingScreen';
import { useRouter } from 'expo-router';

export default function Landing() {
  const router = useRouter();

  return (
    <LandingScreen
      navigation={{
        navigate: (screen: string) => router.push(`/${screen.toLowerCase()}`)
      }}
    />
  );
}
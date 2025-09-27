import React from 'react';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useRouter } from 'expo-router';

export default function Profile() {
  const router = useRouter();

  return (
    <ProfileScreen
      navigation={{
        goBack: () => router.back(),
        navigate: (screen: string) => router.push(`/${screen.toLowerCase()}`),
      }}
    />
  );
}
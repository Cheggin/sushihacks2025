import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../components/Card';
import { InputField } from '../components/InputField';
import { SelectField } from '../components/SelectField';
import { Button } from '../components/Button';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/colors';
import { predictFeatures } from '../services/api';

interface ProfileData {
  name: string;
  age: string;
  sex: string;
  bmi: string;
  nrs: string;
  palmarBowing: string;
  crossSectionalArea: string;
}

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'Captain Fisher',
    age: '',
    sex: '',
    bmi: '',
    nrs: '',
    palmarBowing: '',
    crossSectionalArea: '',
  });

  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('userProfile');
      if (savedData) {
        setProfileData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const saveProfileData = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrediction = async () => {
    console.log('Starting prediction with data:', profileData);

    // Validate required fields
    if (!profileData.age || !profileData.bmi || !profileData.sex ||
        !profileData.crossSectionalArea || !profileData.palmarBowing || !profileData.nrs) {
      Alert.alert('Missing Data', 'Please fill in all health and clinical measurements');
      return;
    }

    setPredicting(true);
    try {
      console.log('Calling API...');
      const result = await predictFeatures(
        profileData.age,
        profileData.bmi,
        profileData.crossSectionalArea,
        profileData.palmarBowing,
        profileData.nrs,
        profileData.sex
      );

      console.log('API Response:', result);

      // Get risk factors from metadata
      const riskFactors = result.metadata.risk_factors || [];
      const riskLevel = result.metadata.risk_level || 'Unknown';

      let message = `Risk Score: ${(result.prediction * 100).toFixed(1)}%\n`;
      message += `Confidence: ${(result.confidence * 100).toFixed(0)}%\n`;
      message += `Risk Level: ${riskLevel}\n\n`;

      if (riskFactors.length > 0) {
        message += `Risk Factors:\n`;
        riskFactors.forEach((factor: string) => {
          message += `• ${factor}\n`;
        });
      }

      Alert.alert(
        'Carpal Tunnel Syndrome Risk Assessment',
        message,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to get prediction. Make sure the backend server is running.');
      console.error('Prediction error:', error);
    } finally {
      setPredicting(false);
    }
  };

  const updateField = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const validateNRS = (value: string) => {
    const num = parseFloat(value);
    if (value && (isNaN(num) || num < 0 || num > 10)) {
      return 'NRS must be between 0 and 10';
    }
    return '';
  };

  return (
    <LinearGradient
      colors={[Colors.background, Colors.white]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.profileCard}>
            <View style={styles.avatarSection}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.profileName}>{profileData.name}</Text>
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <InputField
              label="Name"
              value={profileData.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder="Enter your name"
            />

            <InputField
              label="Age"
              value={profileData.age}
              onChangeText={(text) => updateField('age', text)}
              placeholder="Enter your age"
              keyboardType="numeric"
              unit="years"
            />

            <SelectField
              label="Sex"
              value={profileData.sex}
              onValueChange={(value) => updateField('sex', value)}
              options={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' },
              ]}
              placeholder="Select sex"
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Health Metrics</Text>

            <InputField
              label="BMI (Body Mass Index)"
              value={profileData.bmi}
              onChangeText={(text) => updateField('bmi', text)}
              placeholder="Enter BMI"
              keyboardType="decimal-pad"
              unit="kg/m²"
              helper="Normal range: 18.5 - 24.9"
            />

            <InputField
              label="NRS (Numeric Rating Scale)"
              value={profileData.nrs}
              onChangeText={(text) => updateField('nrs', text)}
              placeholder="Pain scale (0-10)"
              keyboardType="numeric"
              helper="0 = No pain, 10 = Worst pain"
              error={validateNRS(profileData.nrs)}
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Clinical Measurements</Text>

            <InputField
              label="Palmar Bowing (PB)"
              value={profileData.palmarBowing}
              onChangeText={(text) => updateField('palmarBowing', text)}
              placeholder="Enter measurement"
              keyboardType="decimal-pad"
              unit="mm"
              helper="Distance of median nerve palmar bowing"
            />

            <InputField
              label="Cross-Sectional Area (CSA)"
              value={profileData.crossSectionalArea}
              onChangeText={(text) => updateField('crossSectionalArea', text)}
              placeholder="Enter measurement"
              keyboardType="decimal-pad"
              unit="mm²"
              helper="Median nerve cross-sectional area"
            />
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              title="Save Profile"
              onPress={saveProfileData}
              loading={loading}
              size="large"
              style={styles.saveButton}
            />

            <Button
              title="Get Prediction"
              onPress={handlePrediction}
              loading={predicting}
              size="large"
              variant="secondary"
              style={styles.predictionButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.heading,
    fontSize: 20,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  profileCard: {
    marginBottom: Spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  profileName: {
    ...Typography.heading,
    fontSize: 22,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.subheading,
    marginBottom: Spacing.lg,
    color: Colors.text.primary,
  },
  buttonContainer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  saveButton: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  predictionButton: {
    width: '100%',
  },
});
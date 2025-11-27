import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import apiService from '../services/api';

const ServerUrlScreen = ({navigation}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {setServer} = useAuth();

  const handleSubmit = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a server URL');
      return;
    }

    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      Alert.alert(
        'Error',
        'URL must start with http:// or https://\nExample: http://192.168.1.100:3000',
      );
      return;
    }

    setIsLoading(true);

    try {
      const isValid = await apiService.validateServerUrl(url);

      if (isValid) {
        await setServer(url);
        navigation.replace('Login');
      } else {
        Alert.alert(
          'Connection Failed',
          'Unable to reach the server. Please check the URL and try again.',
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to validate server URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>Parking Machine Assistant</Text>
        <Text style={styles.subtitle}>Configure Server</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Server URL</Text>
          <TextInput
            style={styles.input}
            placeholder="http://192.168.1.100:3000"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={!isLoading}
          />

          <Text style={styles.hint}>
            Enter the backend server URL. Make sure the server is running and
            accessible.
          </Text>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ServerUrlScreen;

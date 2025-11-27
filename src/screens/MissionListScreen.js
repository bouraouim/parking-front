import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import apiService from '../services/api';
import {storageService} from '../services/storage';
import notificationService from '../services/notification';

const MissionListScreen = ({navigation}) => {
  const [missions, setMissions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(true);
  const {logout} = useAuth();

  useEffect(() => {
    loadMissions();
    checkNotificationPermissions();

    // Setup notification listeners
    notificationService.setupNotificationListeners(navigation);

    // Focus listener to reload missions when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadMissions();
    });

    return unsubscribe;
  }, [navigation]);

  const checkNotificationPermissions = async () => {
    const hasPermission = await notificationService.checkPermissions();
    setHasNotificationPermission(hasPermission);
  };

  const requestNotificationPermissions = async () => {
    const granted = await notificationService.requestPermissions();
    if (granted) {
      setHasNotificationPermission(true);
      await notificationService.registerToken();
    } else {
      Alert.alert(
        'Permissions Required',
        'Please enable notifications in your device settings to receive mission updates.',
      );
    }
  };

  const loadMissions = async () => {
    try {
      // First load from local storage
      const localMissions = await storageService.getMissions();
      const sorted = storageService.sortMissions(localMissions);
      setMissions(sorted);
    } catch (error) {
      console.error('Failed to load missions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMissions = async () => {
    setIsRefreshing(true);

    try {
      const result = await apiService.getAllMissions();

      if (result.success) {
        // Save to local storage
        await storageService.saveMissions(result.data);

        // Update state with sorted missions
        const sorted = storageService.sortMissions(result.data);
        setMissions(sorted);
      } else {
        Alert.alert('Error', result.error || 'Failed to fetch missions');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching missions');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const getStatusColor = status => {
    switch (status) {
      case 'unopened':
        return '#FF6B6B';
      case 'in_progress':
        return '#FFA500';
      case 'completed':
        return '#51CF66';
      default:
        return '#999';
    }
  };

  const getStatusText = status => {
    switch (status) {
      case 'unopened':
        return 'New';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const renderMissionItem = ({item}) => {
    const payload = item.payload || {};
    const isUnopened = item.status === 'unopened';

    return (
      <TouchableOpacity
        style={[
          styles.missionCard,
          isUnopened && styles.missionCardUnopened,
        ]}
        onPress={() =>
          navigation.navigate('MissionDetails', {missionId: item.missionId})
        }>
        <View style={styles.missionHeader}>
          <Text style={styles.missionTitle}>{payload.machineName || 'N/A'}</Text>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: getStatusColor(item.status)},
            ]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.missionDetails}>
          <Text style={styles.detailText}>Cashier: {payload.cashier || 'N/A'}</Text>
          <Text style={styles.detailText}>Date: {payload.date || 'N/A'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading missions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Missions</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {!hasNotificationPermission && (
        <TouchableOpacity
          style={styles.permissionBanner}
          onPress={requestNotificationPermissions}>
          <Text style={styles.permissionText}>
            ⚠️ Enable notifications to receive mission updates
          </Text>
          <Text style={styles.permissionAction}>Tap to enable</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={missions}
        renderItem={renderMissionItem}
        keyExtractor={item => item.missionId}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={fetchMissions}
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No missions yet</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionBanner: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE69C',
  },
  permissionText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  permissionAction: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  missionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  missionCardUnopened: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  missionDetails: {
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  amountRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
  },
});

export default MissionListScreen;

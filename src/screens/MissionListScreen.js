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
  ActivityIndicator,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {useLanguage} from '../context/LanguageContext';
import {getTranslation, formatTranslation} from '../i18n/translations';
import apiService from '../services/api';
import {storageService} from '../services/storage';
import notificationService from '../services/notification';

const MissionListScreen = ({navigation}) => {
  const [missions, setMissions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const {logout} = useAuth();
  const {language, changeLanguage} = useLanguage();
  
  const t = (key, params) => {
    return params ? formatTranslation(language, key, params) : getTranslation(language, key);
  };

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

  const loadMissions = async (page = 1, append = false) => {
    try {
      if (!append) {
        // First load from local storage for quick display
        const localMissions = await storageService.getMissions();
        if (localMissions.length > 0) {
          setMissions(localMissions);
        }
      }

      // Fetch data from API with pagination
      const result = await apiService.getAllMissions(page, 10);
      console.log('Fetched missions:', result);
      if (result.success) {
        const newMissions = result.data;
        const pagination = result.pagination;
        if (append) {
          // Append new missions to existing list
          setMissions(prev => [...prev, ...newMissions]);
        } else {
          // Replace missions and save to local storage
          await storageService.saveMissions(newMissions);
          setMissions(newMissions);
        }

        // Update pagination state
        setCurrentPage(pagination.page);
        setHasMorePages(pagination.hasNextPage);
        setTotalPages(pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to load missions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMissions = async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    setHasMorePages(true);

    try {
      const result = await apiService.getAllMissions(1, 10);

      if (result.success) {
        const newMissions = result.data;
        const pagination = result.pagination;

        // Replace all missions in storage with fresh data
        await storageService.saveMissions(newMissions);

        // Update state with missions from API (already sorted by backend)
        setMissions(newMissions);

        // Update pagination state
        setCurrentPage(pagination.page);
        setHasMorePages(pagination.hasNextPage);
        setTotalPages(pagination.totalPages);
      } else {
        Alert.alert('Error', result.error || 'Failed to fetch missions');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching missions');
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadMoreMissions = async () => {
    console.log('Load more missions triggered', isLoadingMore, hasMorePages);
    if (isLoadingMore || !hasMorePages) return;

    setIsLoadingMore(true);
    try {
      await loadMissions(currentPage + 1, true);
    } catch (error) {
      console.error('Failed to load more missions:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(t('logout'), t('logoutConfirm'), [
      {text: t('cancel'), style: 'cancel'},
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          // Don't navigate - let AuthContext handle the navigation automatically
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
        return t('statusNew');
      case 'in_progress':
        return t('statusInProgress');
      case 'completed':
        return t('statusCompleted');
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
          <Text style={styles.missionTitle}>{payload.machineName || t('na')}</Text>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: getStatusColor(item.status)},
            ]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.missionDetails}>
          <Text style={styles.detailText}>{t('cashier')}: {payload.cashier || t('na')}</Text>
          <Text style={styles.detailText}>{t('date')}: {payload.date || t('na')}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>{t('loadingMissions')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => changeLanguage(language === 'en' ? 'fr' : 'en')}
          style={styles.languageButton}>
          <Text style={styles.languageText}>{language === 'en' ? 'FR' : 'EN'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('missions')}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>

      {!hasNotificationPermission && (
        <TouchableOpacity
          style={styles.permissionBanner}
          onPress={requestNotificationPermissions}>
          <Text style={styles.permissionText}>
            {t('notificationPermission')}
          </Text>
          <Text style={styles.permissionAction}>{t('tapToEnable')}</Text>
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
        onEndReached={loadMoreMissions}
        onEndReachedThreshold={0.7}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingMoreText}>{t('loadingMore')}</Text>
            </View>
          ) : !hasMorePages && missions.length > 0 ? (
            <View style={styles.endOfList}>
              <Text style={styles.endOfListText}>{t('allMissionsLoaded')}</Text>
              <Text style={styles.endOfListSubtext}>
                {t('pageOf', {current: currentPage, total: totalPages})}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('noMissions')}</Text>
            <Text style={styles.emptySubtext}>{t('pullToRefresh')}</Text>
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
  languageButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  languageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  endOfList: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f9ff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  endOfListText: {
    fontSize: 16,
    color: '#1e40af',
    fontWeight: '600',
    marginBottom: 4,
  },
  endOfListSubtext: {
    fontSize: 13,
    color: '#3b82f6',
  },
});

export default MissionListScreen;

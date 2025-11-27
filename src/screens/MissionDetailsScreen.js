import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Brightness from 'expo-brightness';
import apiService from '../services/api';
import {storageService} from '../services/storage';

const MissionDetailsScreen = ({route, navigation}) => {
  const {missionId} = route.params;
  const [mission, setMission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [tasks, setTasks] = useState({
    collectNotes: false,
    collectCoins: false,
    refillNotes: false,
    refillCoins: false,
    maintenance: [],
  });

  const originalBrightness = useRef(0);

  useEffect(() => {
    loadMission();
  }, [missionId]);

  useEffect(() => {
    // Initialize maintenance tasks checklist
    if (mission?.payload?.maintenance) {
      const maintenanceTasks = mission.payload.maintenance.map(task => ({
        task: typeof task === 'string' ? task : task.task,
        completed: typeof task === 'object' ? task.completed : false,
      }));
      setTasks(prev => ({...prev, maintenance: maintenanceTasks}));
    }

    // Initialize other task states from mission data
    if (mission?.payload) {
      setTasks(prev => ({
        ...prev,
        collectNotes: mission.payload.collect?.notes?.completed || false,
        collectCoins: mission.payload.collect?.coins?.completed || false,
        refillNotes: mission.payload.refill?.notes?.completed || false,
        refillCoins: mission.payload.refill?.coins?.completed || false,
      }));
    }
  }, [mission]);

  const loadMission = async () => {
    try {
      // First check local storage
      let localMission = await storageService.getMissionById(missionId);

      if (localMission && localMission.status === 'unopened') {
        // Mark as in progress locally
        await storageService.updateMission(missionId, {
          status: 'in_progress',
          openedAt: new Date().toISOString(),
        });

        // Also call API to update on server
        await apiService.openMission(missionId);

        localMission.status = 'in_progress';
      }

      // Fetch fresh data from server
      const result = await apiService.getMissionById(missionId);

      if (result.success) {
        setMission(result.data);
        // Update local storage
        await storageService.updateMission(missionId, result.data);
      } else if (localMission) {
        // Use local data if API fails
        setMission(localMission);
      } else {
        Alert.alert('Error', 'Mission not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Failed to load mission:', error);
      Alert.alert('Error', 'Failed to load mission details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    Alert.alert(
      'Submit Mission',
      'Are you sure you want to submit this mission?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Submit',
          onPress: async () => {
            setIsSubmitting(true);

            try {
              // Format the update data according to the new structure
              const updateData = {
                status: 'completed',
                collect: {
                  notes: { completed: tasks.collectNotes },
                  coins: { completed: tasks.collectCoins },
                },
                refill: {
                  coins: { completed: tasks.refillCoins },
                  notes: { completed: tasks.refillNotes },
                },
                maintenance: tasks.maintenance.map((task, index) => ({
                  index: index,
                  completed: task.completed,
                })),
              };

              const result = await apiService.updateMission(
                missionId,
                updateData,
              );

              if (result.success) {
                // Update local storage
                await storageService.updateMission(missionId, {
                  status: 'completed',
                  completedAt: new Date().toISOString(),
                });

                Alert.alert('Success', 'Mission completed successfully', [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]);
              } else {
                Alert.alert('Error', result.error || 'Failed to submit mission');
                // Keep as in_progress locally
              }
            } catch (error) {
              Alert.alert('Error', 'An error occurred while submitting');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ],
    );
  };

  const handleShowQR = async () => {
    try {
      // Get current brightness
      const brightness = await Brightness.getBrightnessAsync();
      originalBrightness.current = brightness;

      // Set to maximum brightness
      await Brightness.setBrightnessAsync(1);

      setShowQR(true);
    } catch (error) {
      console.error('Failed to adjust brightness:', error);
      setShowQR(true);
    }
  };

  const handleCloseQR = async () => {
    try {
      // Restore original brightness
      await Brightness.setBrightnessAsync(originalBrightness.current);
    } catch (error) {
      console.error('Failed to restore brightness:', error);
    }

    setShowQR(false);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading mission...</Text>
      </View>
    );
  }

  if (!mission) {
    return (
      <View style={styles.centerContainer}>
        <Text>Mission not found</Text>
      </View>
    );
  }

  const payload = mission.payload || {};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mission Details</Text>
        <View style={{width: 50}} />
      </View>

      <ScrollView style={styles.content}>
        {/* Mission Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mission Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Machine:</Text>
            <Text style={styles.infoValue}>{payload.machineName || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cashier:</Text>
            <Text style={styles.infoValue}>{payload.cashier || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{payload.date || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text
              style={[
                styles.infoValue,
                {color: mission.status === 'completed' ? '#51CF66' : '#FFA500'},
              ]}>
              {mission.status === 'completed' ? 'Completed' : 'In Progress'}
            </Text>
          </View>
        </View>

        {/* Collection Tasks */}
        {payload.collect && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Collection</Text>
            
            {/* Collect Notes */}
            {payload.collect.notes && (
              <TouchableOpacity
                style={styles.taskRow}
                onPress={() => setTasks({...tasks, collectNotes: !tasks.collectNotes})}>
                <View style={styles.checkbox}>
                  {tasks.collectNotes && <View style={styles.checkboxChecked} />}
                </View>
                <View style={styles.taskContent}>
                  <Text style={styles.taskText}>Collect Notes</Text>
                  <Text style={styles.taskDetail}>
                    Amount: ${payload.collect.notes.amount || 0}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Collect Coins */}
            {payload.collect.coins && (
              <TouchableOpacity
                style={styles.taskRow}
                onPress={() => setTasks({...tasks, collectCoins: !tasks.collectCoins})}>
                <View style={styles.checkbox}>
                  {tasks.collectCoins && <View style={styles.checkboxChecked} />}
                </View>
                <View style={styles.taskContent}>
                  <Text style={styles.taskText}>Collect Coins</Text>
                  <Text style={styles.taskDetail}>
                    Amount: ${payload.collect.coins.amount || 0}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Refill Tasks */}
        {payload.refill && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Refill</Text>
            
            {/* Refill Coins */}
            {payload.refill.coins && (
              <TouchableOpacity
                style={styles.taskRow}
                onPress={() => setTasks({...tasks, refillCoins: !tasks.refillCoins})}>
                <View style={styles.checkbox}>
                  {tasks.refillCoins && <View style={styles.checkboxChecked} />}
                </View>
                <View style={styles.taskContent}>
                  <Text style={styles.taskText}>Refill Coins</Text>
                  <Text style={styles.taskDetail}>
                    Amount: ${payload.refill.coins.amount || 0}
                  </Text>
                  {payload.refill.coins.coinTypes &&
                    Object.entries(payload.refill.coins.coinTypes).map(
                      ([type, amount]) => (
                        <Text key={type} style={styles.taskSubDetail}>
                          • ${type}: {amount} coins
                        </Text>
                      ),
                    )}
                </View>
              </TouchableOpacity>
            )}

            {/* Refill Notes */}
            {payload.refill.notes && (
              <TouchableOpacity
                style={styles.taskRow}
                onPress={() => setTasks({...tasks, refillNotes: !tasks.refillNotes})}>
                <View style={styles.checkbox}>
                  {tasks.refillNotes && <View style={styles.checkboxChecked} />}
                </View>
                <View style={styles.taskContent}>
                  <Text style={styles.taskText}>Refill Notes</Text>
                  <Text style={styles.taskDetail}>
                    Amount: ${payload.refill.notes.amount || 0}
                  </Text>
                  {payload.refill.notes.noteTypes &&
                    Object.entries(payload.refill.notes.noteTypes).map(
                      ([type, amount]) => (
                        <Text key={type} style={styles.taskSubDetail}>
                          • ${type}: {amount} notes
                        </Text>
                      ),
                    )}
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Maintenance Tasks */}
        {payload.maintenance && payload.maintenance.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Maintenance</Text>
            {tasks.maintenance.map((task, index) => (
              <TouchableOpacity
                key={index}
                style={styles.taskRow}
                onPress={() => {
                  const updatedMaintenance = [...tasks.maintenance];
                  updatedMaintenance[index] = {
                    ...updatedMaintenance[index],
                    completed: !updatedMaintenance[index].completed,
                  };
                  setTasks({...tasks, maintenance: updatedMaintenance});
                }}>
                <View style={styles.checkbox}>
                  {task.completed && <View style={styles.checkboxChecked} />}
                </View>
                <View style={styles.taskContent}>
                  <Text style={styles.taskText}>{task.task}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* QR Code Button */}
        {payload.qrCode && (
          <TouchableOpacity
            style={styles.qrButton}
            onPress={handleShowQR}>
            <Text style={styles.qrButtonText}>Show QR Code</Text>
          </TouchableOpacity>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {mission.status === 'completed' ? 'Update Mission' : 'Submit Mission'}
            </Text>
          )}
        </TouchableOpacity>

        {mission.status === 'completed' && (
          <View style={styles.completedBanner}>
            <Text style={styles.completedText}>✓ Mission Completed</Text>
          </View>
        )}
      </ScrollView>

      {/* QR Code Modal */}
      <Modal visible={showQR} transparent animationType="fade">
        <View style={styles.qrModal}>
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>Mission QR Code</Text>
            <View style={styles.qrCodeWrapper}>
              <QRCode value={payload.qrCode || 'N/A'} size={250} />
            </View>
            <Text style={styles.qrValue}>{payload.qrCode}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseQR}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 50,
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  taskRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#007AFF',
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  taskSubDetail: {
    fontSize: 13,
    color: '#999',
    marginLeft: 12,
    marginTop: 2,
  },
  qrButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#51CF66',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  completedBanner: {
    backgroundColor: '#51CF66',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  completedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  qrValue: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MissionDetailsScreen;

export const translations = {
  en: {
    // Common
    back: 'Back',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    ok: 'OK',
    submit: 'Submit',
    logout: 'Logout',
    
    // Auth & Setup
    serverUrl: 'Server URL',
    serverUrlPlaceholder: 'Enter server URL',
    connect: 'Connect',
    connectingServer: 'Connecting to server...',
    serverUrlRequired: 'Server URL is required',
    invalidServerUrl: 'Invalid server URL. Please check and try again.',
    login: 'Login',
    username: 'Username',
    usernamePlaceholder: 'Enter your username',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    loggingIn: 'Logging in...',
    usernameRequired: 'Username is required',
    passwordRequired: 'Password is required',
    
    // Mission List
    missions: 'Missions',
    logoutConfirm: 'Are you sure you want to logout?',
    loadingMissions: 'Loading missions...',
    noMissions: 'No missions yet',
    pullToRefresh: 'Pull down to refresh',
    loadingMore: 'Loading more missions...',
    allMissionsLoaded: 'All missions loaded',
    pageOf: 'Page {{current}} of {{total}}',
    notificationPermission: '⚠️ Enable notifications to receive mission updates',
    tapToEnable: 'Tap to enable',
    permissionsRequired: 'Permissions Required',
    enableNotificationsMessage: 'Please enable notifications in your device settings to receive mission updates.',
    failedToFetch: 'Failed to fetch missions',
    errorOccurred: 'An error occurred while fetching missions',
    
    // Mission Status
    statusNew: 'New',
    statusInProgress: 'In Progress',
    statusCompleted: 'Completed',
    
    // Mission Details
    missionDetails: 'Mission Details',
    missionInformation: 'Mission Information',
    machine: 'Machine',
    cashier: 'Cashier',
    date: 'Date',
    status: 'Status',
    collection: 'Collection',
    collectNotes: 'Collect Notes',
    collectCoins: 'Collect Coins',
    amount: 'Amount',
    refill: 'Refill',
    refillCoins: 'Refill Coins',
    refillNotes: 'Refill Notes',
    maintenance: 'Maintenance',
    comment: 'Comment',
    commentPlaceholder: 'Add a comment about this mission...',
    showQRCode: 'Show QR Code',
    missionQRCode: 'Mission QR Code',
    close: 'Close',
    submitMission: 'Submit Mission',
    submitMissionConfirm: 'Are you sure you want to submit this mission?',
    missionSubmittedSuccess: 'Mission submitted successfully',
    missionCompleted: '✓ Mission Completed',
    failedToSubmit: 'Failed to submit mission',
    errorSubmitting: 'An error occurred while submitting',
    missionNotFound: 'Mission not found',
    failedToLoadMission: 'Failed to load mission details',
    na: 'N/A',
    coins: 'coins',
    notes: 'notes',
  },
  fr: {
    // Common
    back: 'Retour',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    ok: 'OK',
    submit: 'Soumettre',
    logout: 'Déconnexion',
    
    // Auth & Setup
    serverUrl: 'URL du serveur',
    serverUrlPlaceholder: 'Entrez l\'URL du serveur',
    connect: 'Connecter',
    connectingServer: 'Connexion au serveur...',
    serverUrlRequired: 'L\'URL du serveur est requise',
    invalidServerUrl: 'URL du serveur invalide. Veuillez vérifier et réessayer.',
    login: 'Connexion',
    username: 'Nom d\'utilisateur',
    usernamePlaceholder: 'Entrez votre nom d\'utilisateur',
    password: 'Mot de passe',
    passwordPlaceholder: 'Entrez votre mot de passe',
    loggingIn: 'Connexion en cours...',
    usernameRequired: 'Le nom d\'utilisateur est requis',
    passwordRequired: 'Le mot de passe est requis',
    
    // Mission List
    missions: 'Missions',
    logoutConfirm: 'Êtes-vous sûr de vouloir vous déconnecter?',
    loadingMissions: 'Chargement des missions...',
    noMissions: 'Aucune mission pour le moment',
    pullToRefresh: 'Tirez vers le bas pour actualiser',
    loadingMore: 'Chargement de plus de missions...',
    allMissionsLoaded: 'Toutes les missions chargées',
    pageOf: 'Page {{current}} sur {{total}}',
    notificationPermission: '⚠️ Activez les notifications pour recevoir les mises à jour des missions',
    tapToEnable: 'Appuyez pour activer',
    permissionsRequired: 'Autorisations requises',
    enableNotificationsMessage: 'Veuillez activer les notifications dans les paramètres de votre appareil pour recevoir les mises à jour des missions.',
    failedToFetch: 'Échec de la récupération des missions',
    errorOccurred: 'Une erreur s\'est produite lors de la récupération des missions',
    
    // Mission Status
    statusNew: 'Nouvelle',
    statusInProgress: 'En cours',
    statusCompleted: 'Terminée',
    
    // Mission Details
    missionDetails: 'Détails de la mission',
    missionInformation: 'Informations sur la mission',
    machine: 'Machine',
    cashier: 'Caissier',
    date: 'Date',
    status: 'Statut',
    collection: 'Collecte',
    collectNotes: 'Collecter les billets',
    collectCoins: 'Collecter les pièces',
    amount: 'Montant',
    refill: 'Remplissage',
    refillCoins: 'Remplir les pièces',
    refillNotes: 'Remplir les billets',
    maintenance: 'Maintenance',
    comment: 'Commentaire',
    commentPlaceholder: 'Ajoutez un commentaire sur cette mission...',
    showQRCode: 'Afficher le code QR',
    missionQRCode: 'Code QR de la mission',
    close: 'Fermer',
    submitMission: 'Soumettre la mission',
    submitMissionConfirm: 'Êtes-vous sûr de vouloir soumettre cette mission?',
    missionSubmittedSuccess: 'Mission soumise avec succès',
    missionCompleted: '✓ Mission terminée',
    failedToSubmit: 'Échec de la soumission de la mission',
    errorSubmitting: 'Une erreur s\'est produite lors de la soumission',
    missionNotFound: 'Mission non trouvée',
    failedToLoadMission: 'Échec du chargement des détails de la mission',
    na: 'N/D',
    coins: 'pièces',
    notes: 'billets',
  },
};

export const getTranslation = (lang, key) => {
  return translations[lang]?.[key] || translations.en[key] || key;
};

export const formatTranslation = (lang, key, params) => {
  let text = getTranslation(lang, key);
  if (params) {
    Object.keys(params).forEach(param => {
      text = text.replace(`{{${param}}}`, params[param]);
    });
  }
  return text;
};

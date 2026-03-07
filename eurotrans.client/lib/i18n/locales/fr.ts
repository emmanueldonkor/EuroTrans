import { en } from "./en"
import type { TranslationDictionary } from "./types"

export const fr: TranslationDictionary = {
  ...en,
  // Common
  "common.save": "Enregistrer",
  "common.cancel": "Annuler",
  "common.delete": "Supprimer",
  "common.edit": "Modifier",
  "common.close": "Fermer",
  "common.search": "Rechercher",
  "common.filter": "Filtrer",
  "common.loading": "Chargement...",
  "common.error": "Une erreur est survenue",
  "common.success": "Succ\u00e8s",
  "common.logout": "D\u00e9connexion",
  "common.notAvailable": "N/D",
  "common.toggleMenu": "Basculer le menu",

  // Landing
  "landing.title": "EuroTrans",
  "landing.tagline": "Gestion centralis\u00e9e de flotte et exp\u00e9ditions",
  "landing.login": "Se connecter",

  // Language
  "language.switch": "Changer de langue",
  "language.saveErrorTitle": "Langue non enregistr\u00e9e",
  "language.saveErrorDescription": "Impossible d'enregistrer votre langue pr\u00e9f\u00e9r\u00e9e. Veuillez r\u00e9essayer.",

  // Navigation
  "nav.home": "Accueil",
  "nav.shipments": "Exp\u00e9ditions",
  "nav.liveMap": "Carte en Direct",
  "nav.fleet": "Flotte",
  "nav.employees": "Employ\u00e9s",
  "nav.analytics": "Analytique",
  "nav.documents": "Documents",
  "nav.currentJob": "T\u00e2che Actuelle",
  "nav.profile": "Profil",

  // Shipments
  "shipments.title": "Exp\u00e9ditions",
  "shipments.create": "Cr\u00e9er une Exp\u00e9dition",
  "shipments.trackingId": "ID de Suivi",
  "shipments.status": "Statut",
  "shipments.driver": "Chauffeur",
  "shipments.route": "Itin\u00e9raire",
  "shipments.lastUpdate": "Derni\u00e8re Mise \u00e0 Jour",
  "shipments.details": "D\u00e9tails de l'Exp\u00e9dition",

  // Status
  "status.draft": "Brouillon",
  "status.unassigned": "Non Assign\u00e9",
  "status.inTransit": "En Transit",
  "status.delivered": "Livr\u00e9",

  // Driver
  "driver.greeting": "Bonjour",
  "driver.noActiveJob": "Aucune t\u00e2che active assign\u00e9e",
  "driver.startJourney": "Commencer le Trajet",
  "driver.markDelivered": "Marquer comme Livr\u00e9",
  "driver.uploadProof": "T\u00e9l\u00e9charger Preuve de Livraison",

  // Live Map
  "map.loadingData": "Chargement des donn\u00e9es de la carte...",
  "map.errorTitle": "Impossible de charger la carte en direct",
  "map.errorMessage": "Erreur inattendue lors du chargement des rep\u00e8res de carte.",
  "map.title": "Carte en Direct",
  "map.description": "Suivi en temps r\u00e9el des exp\u00e9ditions en transit",
  "map.emptyTitle": "Aucune position en direct pour le moment",
  "map.emptyDescription":
    "D\u00e9marrez le transit et envoyez au moins une mise \u00e0 jour de position pour afficher une exp\u00e9dition sur la carte.",
  "map.activeShipments": "Exp\u00e9ditions actives",
  "map.noActiveShipments": "Aucune exp\u00e9dition active",
  "map.badge.stale": "Ancien",
  "map.driverLabel": "Chauffeur",
  "map.updatedLabel": "Mise \u00e0 jour",
  "map.popup.driver": "Chauffeur",
  "map.popup.status": "Statut",

  // Fleet
  "fleet.loading": "Chargement des camions...",
  "fleet.errorTitle": "Impossible de charger la flotte",
  "fleet.errorMessage": "Erreur inattendue lors du chargement de la flotte.",
  "fleet.title": "Flotte",
  "fleet.description": "G\u00e9rez votre flotte de camions",
  "fleet.addTruck": "Ajouter un camion",
  "fleet.table.plateNumber": "Immatriculation",
  "fleet.table.model": "Mod\u00e8le",
  "fleet.table.capacity": "Capacit\u00e9",
  "fleet.table.status": "Statut",
  "fleet.table.actions": "Actions",
  "fleet.table.empty": "Aucun camion trouv\u00e9",
  "fleet.toast.createTitle": "Camion cr\u00e9\u00e9",
  "fleet.toast.createDescription": "La flotte a \u00e9t\u00e9 mise \u00e0 jour.",
  "fleet.toast.createErrorTitle": "\u00c9chec de cr\u00e9ation",
  "fleet.toast.createErrorFallback": "\u00c9chec de la cr\u00e9ation du camion.",
  "fleet.toast.updateTitle": "Camion mis \u00e0 jour",
  "fleet.toast.updateDescription": "{plateNumber} a \u00e9t\u00e9 mis \u00e0 jour avec succ\u00e8s.",
  "fleet.toast.updateErrorTitle": "\u00c9chec de mise \u00e0 jour",
  "fleet.toast.updateErrorFallback": "\u00c9chec de la mise \u00e0 jour du camion.",
  "fleet.toast.updateResultFallback": "\u00c9chec de la mise \u00e0 jour du camion.",
  "fleet.toast.deleteTitle": "Camion supprim\u00e9",
  "fleet.toast.deleteDescription": "Le camion a \u00e9t\u00e9 retir\u00e9 de la flotte.",
  "fleet.toast.deleteErrorTitle": "\u00c9chec de suppression",
  "fleet.toast.deleteErrorFallback": "\u00c9chec de la suppression du camion.",
  "fleet.toast.deleteResultFallback": "\u00c9chec de la suppression du camion.",
  "fleet.dialog.createTitle": "Ajouter un nouveau camion",
  "fleet.dialog.createDescription": "Cr\u00e9ez un nouveau camion dans votre flotte",
  "fleet.dialog.editTitle": "Modifier le camion",
  "fleet.dialog.editDescription": "Mettre \u00e0 jour les informations du camion (uniquement s'il n'est pas en service)",
  "fleet.dialog.deleteTitle": "Supprimer le camion",
  "fleet.dialog.deleteDescription":
    "\u00cates-vous s\u00fbr de vouloir supprimer le camion {plateNumber} ? Cette action est irr\u00e9versible. Le camion ne peut \u00eatre supprim\u00e9 que s'il n'est affect\u00e9 \u00e0 aucune exp\u00e9dition active.",
  "fleet.form.plateNumber": "Immatriculation",
  "fleet.form.model": "Mod\u00e8le",
  "fleet.form.capacity": "Capacit\u00e9 (kg)",
  "fleet.form.status": "Statut",
  "fleet.form.placeholder.plateNumber": "ex. B-TR-1234",
  "fleet.form.placeholder.model": "ex. Mercedes Actros 2545",
  "fleet.form.placeholder.capacity": "ex. 25000",
  "fleet.status.available": "Disponible",
  "fleet.status.inUse": "En service",
  "fleet.status.maintenance": "Maintenance",
  "fleet.action.creating": "Cr\u00e9ation...",
  "fleet.action.create": "Cr\u00e9er le camion",
  "fleet.action.updating": "Mise \u00e0 jour...",
  "fleet.action.update": "Mettre \u00e0 jour le camion",
  "fleet.action.deleting": "Suppression...",

  // Documents
  "documents.table.pod": "POD",

  // Layout
  "layout.redirecting": "Redirection...",
  "layout.loadingSession": "Chargement de votre session...",
  "layout.manager.loadingWorkspace": "Chargement de l'espace manager...",
  "layout.manager.loadErrorTitle": "Impossible de charger votre espace",
  "layout.manager.loadErrorMessage": "Une erreur inattendue s'est produite.",
  "layout.driver.loadingWorkspace": "Chargement de l'espace chauffeur...",
  "layout.driver.loadErrorTitle": "Impossible de charger la session chauffeur",
  "layout.driver.loadErrorMessage": "Une erreur inattendue s'est produite.",

  // Not Found
  "notFound.title": "Page introuvable",
  "notFound.description": "La page que vous recherchez n'existe pas ou a \u00e9t\u00e9 d\u00e9plac\u00e9e.",
  "notFound.returnHome": "Retour \u00e0 l'accueil",
}

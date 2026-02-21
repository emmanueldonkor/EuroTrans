// Internationalization setup for EN, DE, FR

export type Locale = "en" | "de" | "fr"

export const translations = {
  en: {
    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.close": "Close",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Success",
    "common.logout": "Logout",

    // Landing
    "landing.title": "EuroTrans",
    "landing.tagline": "Centralized fleet & shipment management",
    "landing.login": "Login",

    // Navigation
    "nav.home": "Home",
    "nav.shipments": "Shipments",
    "nav.liveMap": "Live Map",
    "nav.fleet": "Fleet",
    "nav.employees": "Employees",
    "nav.analytics": "Analytics",
    "nav.documents": "Documents",
    "nav.currentJob": "Current Job",
    "nav.profile": "Profile",

    // Shipments
    "shipments.title": "Shipments",
    "shipments.create": "Create Shipment",
    "shipments.trackingId": "Tracking ID",
    "shipments.status": "Status",
    "shipments.driver": "Driver",
    "shipments.route": "Route",
    "shipments.lastUpdate": "Last Update",
    "shipments.details": "Shipment Details",

    // Status
    "status.draft": "Draft",
    "status.unassigned": "Unassigned",
    "status.inTransit": "In Transit",
    "status.delivered": "Delivered",

    // Driver
    "driver.greeting": "Hello",
    "driver.noActiveJob": "No active jobs assigned",
    "driver.startJourney": "Start Journey",
    "driver.markDelivered": "Mark Delivered",
    "driver.uploadProof": "Upload Proof of Delivery",
  },
  de: {
    // Common
    "common.save": "Speichern",
    "common.cancel": "Abbrechen",
    "common.delete": "Löschen",
    "common.edit": "Bearbeiten",
    "common.close": "Schließen",
    "common.search": "Suchen",
    "common.filter": "Filtern",
    "common.loading": "Laden...",
    "common.error": "Ein Fehler ist aufgetreten",
    "common.success": "Erfolg",
    "common.logout": "Abmelden",

    // Landing
    "landing.title": "EuroTrans",
    "landing.tagline": "Zentralisierte Flotten- und Sendungsverwaltung",
    "landing.login": "Anmelden",

    // Navigation
    "nav.home": "Startseite",
    "nav.shipments": "Sendungen",
    "nav.liveMap": "Live-Karte",
    "nav.fleet": "Flotte",
    "nav.employees": "Mitarbeiter",
    "nav.analytics": "Analytik",
    "nav.documents": "Dokumente",
    "nav.currentJob": "Aktueller Auftrag",
    "nav.profile": "Profil",

    // Shipments
    "shipments.title": "Sendungen",
    "shipments.create": "Sendung erstellen",
    "shipments.trackingId": "Tracking-ID",
    "shipments.status": "Status",
    "shipments.driver": "Fahrer",
    "shipments.route": "Route",
    "shipments.lastUpdate": "Letzte Aktualisierung",
    "shipments.details": "Sendungsdetails",

    // Status
    "status.draft": "Entwurf",
    "status.unassigned": "Nicht zugewiesen",
    "status.inTransit": "In Transit",
    "status.delivered": "Zugestellt",

    // Driver
    "driver.greeting": "Hallo",
    "driver.noActiveJob": "Keine aktiven Aufträge zugewiesen",
    "driver.startJourney": "Fahrt starten",
    "driver.markDelivered": "Als zugestellt markieren",
    "driver.uploadProof": "Zustellnachweis hochladen",
  },
  fr: {
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
    "common.success": "Succès",
    "common.logout": "Déconnexion",

    // Landing
    "landing.title": "EuroTrans",
    "landing.tagline": "Gestion centralisée de flotte et expéditions",
    "landing.login": "Se connecter",

    // Navigation
    "nav.home": "Accueil",
    "nav.shipments": "Expéditions",
    "nav.liveMap": "Carte en Direct",
    "nav.fleet": "Flotte",
    "nav.employees": "Employés",
    "nav.analytics": "Analytique",
    "nav.documents": "Documents",
    "nav.currentJob": "Tâche Actuelle",
    "nav.profile": "Profil",

    // Shipments
    "shipments.title": "Expéditions",
    "shipments.create": "Créer une Expédition",
    "shipments.trackingId": "ID de Suivi",
    "shipments.status": "Statut",
    "shipments.driver": "Chauffeur",
    "shipments.route": "Itinéraire",
    "shipments.lastUpdate": "Dernière Mise à Jour",
    "shipments.details": "Détails de l'Expédition",

    // Status
    "status.draft": "Brouillon",
    "status.unassigned": "Non Assigné",
    "status.inTransit": "En Transit",
    "status.delivered": "Livré",

    // Driver
    "driver.greeting": "Bonjour",
    "driver.noActiveJob": "Aucune tâche active assignée",
    "driver.startJourney": "Commencer le Trajet",
    "driver.markDelivered": "Marquer comme Livré",
    "driver.uploadProof": "Télécharger Preuve de Livraison",
  },
}

export type TranslationKey = keyof typeof translations.en

export function translate(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] || translations.en[key] || key
}

export function useTranslation(locale: Locale = "en") {
  const t = (key: TranslationKey): string => translate(locale, key)

  return { t, locale }
}

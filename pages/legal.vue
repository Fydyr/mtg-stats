<script setup lang="ts">
definePageMeta({
  alias: ['/mentions-legales', '/legal-mention', '/legal-mentions']
})

const reqUrl = useRequestURL()
const config = useRuntimeConfig()
const siteUrl = computed(() => reqUrl.origin || (config.public.siteUrl as string) || 'https://mtg-stats.aeroliths.fr')

useSeoMeta({
  title: 'Mentions légales | MTG Stats - Portfolio Enzo Fournier',
  ogTitle: 'Mentions légales | MTG Stats - Portfolio Enzo Fournier',
  description: 'Mentions légales du site MTG Stats développé par Enzo Fournier : éditeur, hébergement, propriété intellectuelle et respect des données.',
  ogDescription: 'Mentions légales du site MTG Stats développé par Enzo Fournier : éditeur, hébergement, propriété intellectuelle et respect des données.',
  ogUrl: () => `${siteUrl.value}/legal`,
  ogType: 'website'
})
</script>

<template>
  <div class="legal-page">
    <NuxtLink to="/" class="back">← Retour à l'accueil</NuxtLink>

    <section class="hero" style="margin-bottom: 24px;">
      <h1>Mentions Légales</h1>
      <p>
        Informations légales et réglementaires concernant l'application <strong>MTG Stats</strong>,
        conçue et développée par <strong>Enzo Fournier</strong> dans le cadre de ses projets portfolio.
      </p>
    </section>

    <div class="legal-grid">
      <!-- 1. IDENTIFICATION DE L'ÉDITEUR -->
      <div class="card legal-card">
        <div class="legal-card-header">
          <span class="legal-icon">👤</span>
          <h2>Identification de l'éditeur</h2>
        </div>
        <div class="legal-content">
          <p>Le site <strong>MTG Stats</strong> est édité par :</p>
          <ul>
            <li><strong>Nom & prénom :</strong> Enzo Fournier</li>
            <li><strong>Activité :</strong> Développeur Web & Créateur de projets</li>
            <li><strong>Portfolio officiel :</strong> <a href="https://enzo-f.aeroliths.fr" target="_blank" rel="noopener noreferrer">https://enzo-f.aeroliths.fr ↗</a></li>
            <li><strong>Email de contact :</strong> <a href="mailto:enzofournier.contact@gmail.com">enzofournier.contact@gmail.com</a></li>
            <li><strong>Directeur de la publication :</strong> Enzo Fournier</li>
          </ul>
        </div>
      </div>

      <!-- 2. HÉBERGEMENT -->
      <div class="card legal-card">
        <div class="legal-card-header">
          <span class="legal-icon">🖥️</span>
          <h2>Hébergement du site</h2>
        </div>
        <div class="legal-content">
          <p>Le site est hébergé sur les infrastructures de :</p>
          <ul>
            <li><strong>Hébergeur :</strong> IONOS SARL</li>
            <li><strong>Adresse postale :</strong> 7 place de la Gare, 57200 Sarreguemines, France</li>
            <li><strong>Site officiel :</strong> <a href="https://www.ionos.fr" target="_blank" rel="noopener noreferrer">https://www.ionos.fr ↗</a></li>
          </ul>
        </div>
      </div>

      <!-- 3. PROPRIÉTÉ INTELLECTUELLE & AVERTISSEMENT MTG -->
      <div class="card legal-card">
        <div class="legal-card-header">
          <span class="legal-icon">⚖️</span>
          <h2>Propriété intellectuelle & Droits</h2>
        </div>
        <div class="legal-content">
          <p>
            L'architecture, le code source, le design et l'interface applicative de <strong>MTG Stats</strong> sont la propriété exclusive d'<strong>Enzo Fournier</strong>.
            Toute reproduction ou réutilisation totale ou partielle sans accord préalable est interdite.
          </p>
          <div class="notice-box">
            <strong>Avis légal concernant Magic: The Gathering :</strong>
            <p style="margin: 6px 0 0; font-size: 0.85rem; line-height: 1.5;">
              <em>Magic: The Gathering</em>, ses extensions, logos, symboles et visuels associés sont des marques déposées de
              <strong>Wizards of the Coast LLC</strong> (filiale de <strong>Hasbro, Inc.</strong>).
              Ce site est un projet communautaire et analytique indépendant, à but non lucratif et informatif.
              Il n'est ni affilié, ni sponsorisé, ni validé par Wizards of the Coast ou Hasbro.
            </p>
          </div>
        </div>
      </div>

      <!-- 4. SOURCES DES DONNÉES -->
      <div class="card legal-card">
        <div class="legal-card-header">
          <span class="legal-icon">📊</span>
          <h2>Origine des données & Cotations</h2>
        </div>
        <div class="legal-content">
          <p>Les cotations, historiques et informations de marché proviennent des sources publiques suivantes :</p>
          <ul>
            <li><strong>Cardmarket (Sammelkartenmarkt GmbH & Co. KG) :</strong> Relevés mensuels des prix moyens, planchers et tendances du marché scellé européen.</li>
            <li><strong>Scryfall API :</strong> Métadonnées des extensions, dates de sortie et symboles vectoriels SVG sous licence communautaire.</li>
            <li><strong>MTGJSON :</strong> Identifiants de produits scellés et correspondances de catalogues.</li>
          </ul>
        </div>
      </div>

      <!-- 5. PROTECTION DES DONNÉES PERSONNELLES (RGPD) -->
      <div class="card legal-card" style="grid-column: 1 / -1;">
        <div class="legal-card-header">
          <span class="legal-icon">🔒</span>
          <h2>Protection des données personnelles (RGPD)</h2>
        </div>
        <div class="legal-content">
          <p>
            Conformément à la réglementation européenne (RGPD), ce site respecte scrupuleusement la vie privée de ses utilisateurs :
          </p>
          <ul>
            <li><strong>Aucun cookie publicitaire ni traqueur tiers :</strong> Votre navigation n'est soumise à aucun ciblage publicitaire ni revente de données.</li>
            <li><strong>Stockage local (LocalStorage) :</strong> Les préférences d'affichage (mode tableau/grille, sélection de produits) restent strictement sur votre machine.</li>
            <li><strong>Sécurité & Logs techniques :</strong> Les journaux de requêtes serveur ne sont utilisés qu'à des fins techniques de stabilité et de prévention des attaques.</li>
            <li><strong>Contact :</strong> Pour toute question relative à vos données, vous pouvez écrire directement à <a href="mailto:enzofournier.contact@gmail.com">enzofournier.contact@gmail.com</a>.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legal-page {
  max-width: 900px;
  margin: 0 auto;
}

.legal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 18px;
  margin-top: 20px;
}

.legal-card {
  padding: 24px;
}

.legal-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.legal-icon {
  font-size: 1.5rem;
}

.legal-card h2 {
  font-size: 1.15rem;
  margin: 0;
  color: var(--text);
  font-weight: 700;
}

.legal-content p {
  color: var(--muted);
  line-height: 1.6;
  margin: 0 0 12px;
  font-size: 0.95rem;
}

.legal-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legal-content li {
  color: var(--text);
  font-size: 0.9rem;
  line-height: 1.5;
}

.legal-content a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.legal-content a:hover {
  color: #7aa7ff;
}

.notice-box {
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 8px;
  padding: 12px 16px;
}
</style>

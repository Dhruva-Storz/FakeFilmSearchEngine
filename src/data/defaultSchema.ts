import type { SearchEngineConfig } from '../types/schema';

export const defaultConfig: SearchEngineConfig = {
  engineName: 'Search',
  tagline: 'Search for anything, privately and securely.',
  results: [
    {
      title: 'National Archives – Official Government Records Portal',
      displayUrl: 'www.nationalarchives.gov/records',
      url: undefined,
      description:
        'Access millions of digitised government records, historical documents, and public filings. Updated daily with newly declassified materials and census data going back over 200 years.',
      sitelinks: [
        { text: 'Search Records' },
        { text: 'Request Documents' },
        { text: 'Public Filings' },
        { text: 'About Us' },
      ],
    },
    {
      title: 'Meridian News — Breaking Stories, World Affairs & Analysis',
      displayUrl: 'www.meridiannews.com',
      description:
        'Trusted independent reporting on global events, politics, science, and culture. Our correspondents cover over 80 countries. Subscribe for full access to investigative features.',
    },
    {
      title: 'CityMapper Pro | Urban Transit & Route Planning',
      displayUrl: 'www.citymapperpro.com/routes',
      description:
        'Real-time transit information for over 300 cities worldwide. Plan multi-modal journeys, check live delays, and get walking directions to your nearest stop.',
    },
    {
      title: 'OpenData Hub — Free Datasets for Research & Development',
      displayUrl: 'data.opendatahub.org/datasets',
      description:
        'Download freely licensed datasets across health, finance, climate, transport, and demographics. Over 4 million datasets available from government and academic contributors.',
    },
    {
      title: 'Helix Medical Group | Patient Portal & Appointments',
      displayUrl: 'www.helixmedical.com/patients',
      description:
        'Manage your appointments, view test results, and message your care team securely online. Accepting new patients at all metropolitan locations.',
      sitelinks: [
        { text: 'Book Appointment' },
        { text: 'View Results' },
        { text: 'Find a Doctor' },
      ],
    },
    {
      title: 'Vantage Financial – Personal & Business Banking',
      displayUrl: 'www.vantagefinancial.com',
      description:
        'Competitive rates on savings accounts, mortgages, and business loans. Rated #1 for customer satisfaction five years running. FDIC insured. Open an account in minutes.',
    },
    {
      title: 'The Compendium | Encyclopedia of Science & Technology',
      displayUrl: 'www.thecompendium.org/science',
      description:
        'Peer-reviewed articles on physics, biology, chemistry, computing, and engineering. Written by subject-matter experts and updated continuously by an editorial board of 1,200 academics.',
    },
    {
      title: 'Landsat Earth Observation – Satellite Imagery Archive',
      displayUrl: 'landsat.earthobs.gov/imagery',
      description:
        'Browse and download satellite imagery captured by the Landsat program since 1972. Free access to over 9 million scenes in multiple spectral bands. Used by researchers worldwide.',
    },
    {
      title: 'Summit Properties – Commercial & Residential Real Estate',
      displayUrl: 'www.summitproperties.com/listings',
      description:
        'Browse thousands of residential and commercial listings across 40 states. Connect with licensed agents, schedule viewings, and access neighbourhood reports and school ratings.',
    },
    {
      title: 'Lexara Legal Resources | Case Law, Statutes & Commentary',
      displayUrl: 'www.lexara.com/caselaw',
      description:
        'Search federal and state case law, statutes, regulations, and legal commentary. Used by over 200,000 attorneys and law students. Free basic access; professional plans available.',
      sitelinks: [
        { text: 'Case Law Search' },
        { text: 'Federal Statutes' },
        { text: 'Law Reviews' },
      ],
    },
  ],
};

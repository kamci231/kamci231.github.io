/* ==========================================================================
   PINGPONGSTOP DATABASE CONNECTION MANAGER (db.js)
   Zero-Dependency, REST-based Client supporting Supabase & Firebase
   ========================================================================== */

(function () {
    // 1. Initial Default Credentials (Can be hardcoded directly here for deployment)
    const DEFAULT_CONFIG = {
        type: 'local',         // Options: 'local', 'supabase', 'firebase'
        supabaseUrl: '',       // e.g., 'https://your-project.supabase.co'
        supabaseKey: '',       // e.g., Your Anon Public API Key
        firebaseDbUrl: ''      // e.g., 'https://your-project-default-rtdb.firebaseio.com'
    };

    // 2. State & Settings Loader
    let activeConfig = { ...DEFAULT_CONFIG };

    function loadConfig() {
        try {
            const saved = localStorage.getItem('db_connection_config');
            if (saved) {
                const parsed = JSON.parse(saved);
                activeConfig = { ...DEFAULT_CONFIG, ...parsed };
            } else {
                activeConfig = { ...DEFAULT_CONFIG };
            }
        } catch (e) {
            console.error('Failed to load database config:', e);
            activeConfig = { ...DEFAULT_CONFIG };
        }
    }

    function saveConfig(newConfig) {
        try {
            localStorage.setItem('db_connection_config', JSON.stringify(newConfig));
            activeConfig = { ...DEFAULT_CONFIG, ...newConfig };
        } catch (e) {
            console.error('Failed to save database config:', e);
        }
    }

    // 3. Helper: Sanitize keys for Firebase (Disallow: ., $, #, [, ], /)
    function sanitizeFirebaseKey(str) {
        return encodeURIComponent(str.trim().toLowerCase()).replace(/\./g, '%2E');
    }

    // 4. API Endpoints Logic
    const DB = {
        // Retrieve current active config
        getConfig() {
            return { ...activeConfig };
        },

        // Save new config and re-initialize
        updateConfig(newConfig) {
            saveConfig(newConfig);
            loadConfig();
            return this.isConfigured();
        },

        // Check if database integration is active
        isConfigured() {
            if (activeConfig.type === 'supabase') {
                return !!(activeConfig.supabaseUrl && activeConfig.supabaseKey);
            }
            if (activeConfig.type === 'firebase') {
                return !!activeConfig.firebaseDbUrl;
            }
            return false;
        },

        // Get DB type name for user display
        getDbType() {
            if (activeConfig.type === 'supabase') return 'Supabase';
            if (activeConfig.type === 'firebase') return 'Firebase';
            return '로컬 스토리지';
        },

        // Test credentials without saving
        async testConnection(config) {
            try {
                if (config.type === 'supabase') {
                    if (!config.supabaseUrl || !config.supabaseKey) {
                        throw new Error('Supabase URL 및 API Key를 입력해 주세요.');
                    }
                    const url = `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/popular_searches?limit=1`;
                    const res = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'apikey': config.supabaseKey,
                            'Authorization': `Bearer ${config.supabaseKey}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (!res.ok) {
                        const errText = await res.text();
                        throw new Error(`Supabase 응답 에러 (${res.status}): ${errText}`);
                    }
                    return true;
                } else if (config.type === 'firebase') {
                    if (!config.firebaseDbUrl) {
                        throw new Error('Firebase Database URL을 입력해 주세요.');
                    }
                    let cleanedUrl = config.firebaseDbUrl.replace(/\/$/, '');
                    if (!cleanedUrl.startsWith('http')) {
                        cleanedUrl = `https://${cleanedUrl}`;
                    }
                    const url = `${cleanedUrl}/.json?shallow=true`;
                    const res = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    if (!res.ok) {
                        const errText = await res.text();
                        throw new Error(`Firebase 응답 에러 (${res.status}): ${errText}`);
                    }
                    return true;
                }
                return true; // Local mode always succeeds
            } catch (err) {
                console.warn('DB Connection test failed:', err);
                throw err;
            }
        },

        // Initialize connection
        async init() {
            loadConfig();
            if (!this.isConfigured()) {
                console.log('Database running in Local Storage mode.');
                return false;
            }
            
            try {
                // Perform a quick verification check
                await this.testConnection(activeConfig);
                console.log(`Connected to cloud database: ${this.getDbType()}`);
                return true;
            } catch (err) {
                console.warn(`Failed to connect to ${this.getDbType()}, falling back to Local Storage.`, err);
                return false;
            }
        },

        // 5. Core Action: Record Search Hits
        async recordSearch(keyword) {
            if (!keyword) return;
            const cleanKeyword = keyword.trim();
            if (cleanKeyword.length < 2) return;
            if (/^\d+$/.test(cleanKeyword)) return; // Ignore pure phone numbers

            // A. Supabase REST Insertion
            if (activeConfig.type === 'supabase' && this.isConfigured()) {
                try {
                    const url = `${activeConfig.supabaseUrl.replace(/\/$/, '')}/rest/v1/search_logs`;
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'apikey': activeConfig.supabaseKey,
                            'Authorization': `Bearer ${activeConfig.supabaseKey}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify({ keyword: cleanKeyword })
                    });
                    if (res.ok) return;
                    console.warn(`Supabase log failed (${res.status}), falling back to local.`);
                } catch (e) {
                    console.warn('Supabase logging error:', e);
                }
            }

            // B. Firebase RTDB REST Accumulation (Get -> Increment -> Put)
            if (activeConfig.type === 'firebase' && this.isConfigured()) {
                try {
                    const safeKey = sanitizeFirebaseKey(cleanKeyword);
                    const baseUrl = activeConfig.firebaseDbUrl.replace(/\/$/, '');
                    const recordUrl = `${baseUrl}/search_ranks/${safeKey}.json`;

                    // Read current count
                    const getRes = await fetch(recordUrl);
                    let count = 0;
                    let keywordDisplay = cleanKeyword;
                    if (getRes.ok) {
                        const data = await getRes.json();
                        if (data) {
                            count = data.count || 0;
                            keywordDisplay = data.keyword || cleanKeyword;
                        }
                    }

                    // Increment and save
                    const putRes = await fetch(recordUrl, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            keyword: keywordDisplay,
                            count: count + 1
                        })
                    });
                    if (putRes.ok) return;
                    console.warn(`Firebase update failed (${putRes.status}), falling back to local.`);
                } catch (e) {
                    console.warn('Firebase logging error:', e);
                }
            }

            // C. Fallback: Save to LocalStorage
            this.recordLocalSearch(cleanKeyword);
        },

        // Helper to record search locally
        recordLocalSearch(keyword) {
            try {
                const ranks = JSON.parse(localStorage.getItem('search_ranks') || '{}');
                const cleanKeyword = keyword.toLowerCase();
                const existingKeys = Object.keys(ranks);
                const matchingKey = existingKeys.find(k => k.toLowerCase() === cleanKeyword);

                if (matchingKey) {
                    ranks[matchingKey] = (ranks[matchingKey] || 0) + 1;
                } else {
                    ranks[keyword] = 1;
                }
                localStorage.setItem('search_ranks', JSON.stringify(ranks));
            } catch (err) {
                console.error('Failed to record search locally:', err);
            }
        },

        // 6. Core Action: Retrieve Top 30 Popular Search Rankings
        async getPopularKeywords() {
            // A. Supabase
            if (activeConfig.type === 'supabase' && this.isConfigured()) {
                try {
                    const url = `${activeConfig.supabaseUrl.replace(/\/$/, '')}/rest/v1/popular_searches?select=keyword,count`;
                    const res = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'apikey': activeConfig.supabaseKey,
                            'Authorization': `Bearer ${activeConfig.supabaseKey}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data)) {
                            // Ensure fields match { keyword: string, count: number }
                            return data.map(item => ({
                                keyword: item.keyword,
                                count: parseInt(item.count || 0, 10)
                            }));
                        }
                    }
                } catch (e) {
                    console.warn('Supabase fetch ranks error, returning local:', e);
                }
            }

            // B. Firebase RTDB
            if (activeConfig.type === 'firebase' && this.isConfigured()) {
                try {
                    const baseUrl = activeConfig.firebaseDbUrl.replace(/\/$/, '');
                    const url = `${baseUrl}/search_ranks.json`;
                    const res = await fetch(url);
                    if (res.ok) {
                        const data = await res.json();
                        if (data) {
                            // Convert { key1: {keyword, count}, key2: ... } into sorted array
                            const rankArray = Object.values(data).map(item => ({
                                keyword: item.keyword,
                                count: parseInt(item.count || 0, 10)
                            }));
                            // Sort by count descending
                            rankArray.sort((a, b) => b.count - a.count);
                            return rankArray.slice(0, 30);
                        }
                    }
                } catch (e) {
                    console.warn('Firebase fetch ranks error, returning local:', e);
                }
            }

            // C. Fallback: LocalStorage
            return this.getLocalPopularKeywords();
        },

        // Helper to retrieve local rankings
        getLocalPopularKeywords() {
            try {
                const ranks = JSON.parse(localStorage.getItem('search_ranks') || '{}');
                const rankArray = Object.keys(ranks).map(key => ({
                    keyword: key,
                    count: ranks[key]
                }));
                // Sort by count descending, then alphabetically
                rankArray.sort((a, b) => {
                    if (b.count !== a.count) {
                        return b.count - a.count;
                    }
                    return a.keyword.localeCompare(b.keyword);
                });
                return rankArray.slice(0, 30);
            } catch (err) {
                console.error('Failed to retrieve local popular keywords:', err);
                return [];
            }
        }
    };

    // Attach to global window object
    window.DB = DB;
})();

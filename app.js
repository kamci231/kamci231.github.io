/* ==========================================================================
   CORE LOGIC & EVENT CONTROLLER FOR WORK DIRECTORY
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Core State (Load persistent data from localStorage if exists, otherwise fallback to default Excel)
    let mainDataset = [];
    try {
        const savedData = localStorage.getItem('pingpong_excel_data');
        if (savedData) {
            mainDataset = JSON.parse(savedData);
        } else {
            mainDataset = window.EXCEL_DATA || [];
        }
    } catch (err) {
        console.error('Failed to load saved dataset from localStorage:', err);
        mainDataset = window.EXCEL_DATA || [];
    }
    let filteredDataset = [];
    let currentTheme = 'dark';
    
    const state = {
        searchTerm: '',
        filterDept: '',
        filterTeam: '',
        currentPage: 1,
        pageSize: 20,
        sortColumn: '',
        sortDirection: 'asc' // 'asc' or 'desc'
    };

    // 2. DOM Elements
    const elements = {
        appContainer: document.getElementById('app-container'),
        themeToggleBtn: document.getElementById('theme-toggle-btn'),
        
        // Stats Widgets
        statDepts: document.getElementById('stat-depts'),
        statTeams: document.getElementById('stat-teams'),
        statTasks: document.getElementById('stat-tasks'),
        statPhones: document.getElementById('stat-phones'),
        quickCount: document.getElementById('quick-count'),
        
        // Search & Filters
        globalSearch: document.getElementById('global-search-input'),
        searchClearBtn: document.getElementById('search-clear-btn'),
        filterDeptSelect: document.getElementById('filter-dept'),
        filterTeamSelect: document.getElementById('filter-team'),
        
        // Actions
        btnUploadTrigger: document.getElementById('excel-upload-trigger-btn'),
        btnExportExcel: document.getElementById('btn-export-excel'),
        
        // Results Table
        tableBody: document.getElementById('directory-table-body'),
        resultsCount: document.getElementById('results-count'),
        noResultsCard: document.getElementById('no-results-card'),
        pageSizeSelect: document.getElementById('page-size-select'),
        tableHeaders: document.querySelectorAll('#directory-table th.sortable'),
        
        // Pagination
        paginationNav: document.getElementById('pagination-nav'),
        btnPrevPage: document.getElementById('btn-prev-page'),
        btnNextPage: document.getElementById('btn-next-page'),
        pageNumbersContainer: document.getElementById('page-numbers-container'),
        
        // Detail Modal
        detailModal: document.getElementById('detail-modal'),
        detailDeptBadge: document.getElementById('detail-dept-badge'),
        detailTeamTitle: document.getElementById('detail-team-title'),
        detailPhoneVal: document.getElementById('detail-phone-val'),
        btnDetailPhoneCopy: document.getElementById('btn-detail-phone-copy'),
        detailTasksContent: document.getElementById('detail-tasks-content'),
        detailModalClose: document.getElementById('detail-modal-close'),
        btnDetailClose: document.getElementById('btn-detail-close'),
        
        // Upload Modal
        uploadModal: document.getElementById('upload-modal'),
        uploadModalClose: document.getElementById('upload-modal-close'),
        dropZone: document.getElementById('drop-zone'),
        fileInput: document.getElementById('excel-file-input'),
        importEncoding: document.getElementById('import-encoding'),
        importMode: document.getElementById('import-mode'),
        previewSection: document.getElementById('preview-section'),
        previewRowCount: document.getElementById('preview-row-count'),
        previewTableHead: document.querySelector('#preview-table thead'),
        previewTableBody: document.getElementById('preview-table-body'),
        btnCancelImport: document.getElementById('btn-cancel-import'),
        btnConfirmImport: document.getElementById('btn-confirm-import'),
        btnResetOriginal: document.getElementById('btn-reset-original'),
        
        // Toast
        toastContainer: document.getElementById('toast-container'),

        // Search Rankings Widget elements
        rankingTrack: document.getElementById('ranking-list-track'),
        btnResetRanks: document.getElementById('btn-reset-ranks'),
        btnPrevRank: document.getElementById('btn-prev-rank'),
        btnNextRank: document.getElementById('btn-next-rank'),
        rankPageIndicator: document.getElementById('rank-page-indicator')
    };

    // Temporary parsed upload storage
    let tempImportData = null;

    // Search rankings slide page state
    let rankCarouselPage = 0;
    let totalRankPages = 1;

    /* ==========================================================================
       INIT & SYSTEM SETUP
       ========================================================================== */
    function init() {
        // Initialize Theme from localStorage or default
        initTheme();
        
        // Initial Stats Calculation
        calculateStats(mainDataset);
        
        // Populate Filter Select Dropdowns dynamically from main dataset
        populateFilters(mainDataset);
        
        // Render popular search rankings carousel
        renderSearchRanks();
        
        // Main Render
        filterAndRender();
        
        // Set up event listeners
        bindEvents();
    }

    /* ==========================================================================
       SEARCH RANKINGS MANAGEMENT (Top 30 popular keywords with carousel)
       ========================================================================== */
    function recordSearchKeyword(keyword) {
        if (!keyword) return;
        
        // Standardize keyword (lowercase, trim)
        const cleanKeyword = keyword.trim().toLowerCase();
        if (cleanKeyword.length < 2) return; // Ignore very short queries like 1 char
        
        // Ignore searching exact phone numbers to keep ranks relevant to real keywords
        if (/^\d+$/.test(cleanKeyword)) return;

        try {
            const ranks = JSON.parse(localStorage.getItem('search_ranks') || '{}');
            // Preserve the original casing of the first search
            const existingKeys = Object.keys(ranks);
            const matchingKey = existingKeys.find(k => k.toLowerCase() === cleanKeyword);
            
            if (matchingKey) {
                ranks[matchingKey] = (ranks[matchingKey] || 0) + 1;
            } else {
                ranks[keyword.trim()] = 1;
            }
            
            localStorage.setItem('search_ranks', JSON.stringify(ranks));
            renderSearchRanks();
        } catch (err) {
            console.error('Failed to save search ranking:', err);
        }
    }

    function renderSearchRanks() {
        if (!elements.rankingTrack) return;
        
        elements.rankingTrack.innerHTML = '';
        
        try {
            const ranks = JSON.parse(localStorage.getItem('search_ranks') || '{}');
            const rankArray = Object.keys(ranks).map(key => {
                return { keyword: key, count: ranks[key] };
            });
            
            // Sort by count descending, then alphabetically
            rankArray.sort((a, b) => {
                if (b.count !== a.count) {
                    return b.count - a.count;
                }
                return a.keyword.localeCompare(b.keyword);
            });
            
            // Take Top 30 items
            const top30 = rankArray.slice(0, 30);
            
            if (top30.length === 0) {
                elements.rankingTrack.innerHTML = `
                    <div class="ranking-empty-state">
                        아직 검색 순위 데이터가 없습니다. 검색창에 단어를 치고 엔터(Enter)를 입력해 보세요!
                    </div>
                `;
                elements.btnPrevRank.disabled = true;
                elements.btnNextRank.disabled = true;
                elements.rankPageIndicator.textContent = '1 / 1';
                elements.rankingTrack.style.transform = 'translateX(0)';
                rankCarouselPage = 0;
                totalRankPages = 1;
                return;
            }
            
            // Render ranking cards
            top30.forEach((item, index) => {
                const rankNum = index + 1;
                const card = document.createElement('div');
                card.className = 'ranking-card';
                
                let rankClass = 'rank-normal';
                if (rankNum === 1) rankClass = 'rank-1';
                else if (rankNum === 2) rankClass = 'rank-2';
                else if (rankNum === 3) rankClass = 'rank-3';
                
                card.innerHTML = `
                    <div class="ranking-card-inner" title='"${escapeHTML(item.keyword)}" 단어 즉시 검색'>
                        <span class="ranking-number ${rankClass}">${rankNum}</span>
                        <div class="ranking-content">
                            <span class="ranking-keyword">${escapeHTML(item.keyword)}</span>
                            <span class="ranking-count">${item.count}회 검색</span>
                        </div>
                    </div>
                `;
                
                // Bind click event to trigger immediate search
                card.querySelector('.ranking-card-inner').addEventListener('click', () => {
                    elements.globalSearch.value = item.keyword;
                    state.searchTerm = item.keyword;
                    elements.searchClearBtn.style.display = 'block';
                    state.currentPage = 1;
                    
                    // Trigger search
                    filterAndRender();
                    
                    // Smooth scroll up to search input area
                    elements.globalSearch.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Focus on input
                    elements.globalSearch.focus();
                    
                    // Record it again as a search hit!
                    recordSearchKeyword(item.keyword);
                });
                
                elements.rankingTrack.appendChild(card);
            });
            
            // Calculate carousel paging
            // On desktop we show 5 per screen, on mobile it wraps (but track shifts 100% of viewport width)
            // Flexbasis is 20% on desktop (5 items) and 50% on mobile (2 items)
            const isMobile = window.innerWidth <= 768;
            const itemsPerPage = isMobile ? 2 : 5;
            
            totalRankPages = Math.ceil(top30.length / itemsPerPage) || 1;
            
            // Adjust bounds of carousel page
            if (rankCarouselPage >= totalRankPages) {
                rankCarouselPage = totalRankPages - 1;
            }
            
            updateRankCarouselNav();
            
        } catch (err) {
            console.error('Failed to render search rankings:', err);
        }
    }

    function updateRankCarouselNav() {
        elements.btnPrevRank.disabled = (rankCarouselPage === 0);
        elements.btnNextRank.disabled = (rankCarouselPage >= totalRankPages - 1);
        elements.rankPageIndicator.textContent = `${rankCarouselPage + 1} / ${totalRankPages}`;
        
        // Shift carousel track using percentage translate
        const shiftPercent = rankCarouselPage * 100;
        elements.rankingTrack.style.transform = `translateX(-${shiftPercent}%)`;
    }

    function resetRanks() {
        if (confirm('전체 검색어 순위 기록을 초기화하시겠습니까?')) {
            localStorage.removeItem('search_ranks');
            rankCarouselPage = 0;
            renderSearchRanks();
            showToast('검색 순위 기록이 정상적으로 초기화되었습니다.');
        }
    }

    /* ==========================================================================
       THEME MANAGEMENT (Dark / Light Toggle)
       ========================================================================== */
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            currentTheme = savedTheme;
        } else {
            // Check system preference
            const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
            currentTheme = prefersLight ? 'light' : 'dark';
        }
        
        applyTheme();
    }

    function applyTheme() {
        if (currentTheme === 'light') {
            elements.appContainer.classList.remove('dark-theme');
            elements.appContainer.classList.add('light-theme');
        } else {
            elements.appContainer.classList.remove('light-theme');
            elements.appContainer.classList.add('dark-theme');
        }
        localStorage.setItem('theme', currentTheme);
    }

    function toggleTheme() {
        currentTheme = (currentTheme === 'dark') ? 'light' : 'dark';
        applyTheme();
        showToast((currentTheme === 'dark') ? '다크 모드로 전환되었습니다.' : '라이트 모드로 전환되었습니다.');
    }

    /* ==========================================================================
       STATISTICS & BADGES CALCULATION
       ========================================================================== */
    function calculateStats(dataset) {
        const uniqueDepts = new Set();
        const uniqueTeams = new Set();
        let totalDuties = 0;
        const uniquePhones = new Set();
        
        dataset.forEach(item => {
            if (item.department) uniqueDepts.add(item.department);
            if (item.team) uniqueTeams.add(item.team);
            if (item.duty) totalDuties++;
            if (item.phone) uniquePhones.add(item.phone);
        });
        
        elements.statDepts.textContent = uniqueDepts.size.toLocaleString();
        elements.statTeams.textContent = uniqueTeams.size.toLocaleString();
        elements.statTasks.textContent = totalDuties.toLocaleString();
        elements.statPhones.textContent = uniquePhones.size.toLocaleString();
        
        elements.quickCount.textContent = `총 ${dataset.length}개 업무 구성`;
    }

    /* ==========================================================================
       FILTER POPULATION
       ========================================================================== */
    function populateFilters(dataset) {
        const depts = new Set();
        const teams = new Set();
        
        dataset.forEach(item => {
            if (item.department) depts.add(item.department);
            if (item.team) teams.add(item.team);
        });
        
        // 1. Populate Department Dropdown
        const currentDeptVal = elements.filterDeptSelect.value;
        elements.filterDeptSelect.innerHTML = '<option value="">전체 실과소</option>';
        Array.from(depts).sort().forEach(dept => {
            const opt = document.createElement('option');
            opt.value = dept;
            opt.textContent = dept;
            elements.filterDeptSelect.appendChild(opt);
        });
        elements.filterDeptSelect.value = depts.has(currentDeptVal) ? currentDeptVal : '';
        
        // 2. Populate Team Dropdown
        const currentTeamVal = elements.filterTeamSelect.value;
        elements.filterTeamSelect.innerHTML = '<option value="">전체 소속 팀</option>';
        Array.from(teams).sort().forEach(team => {
            const opt = document.createElement('option');
            opt.value = team;
            opt.textContent = team;
            elements.filterTeamSelect.appendChild(opt);
        });
        elements.filterTeamSelect.value = teams.has(currentTeamVal) ? currentTeamVal : '';
    }

    /* ==========================================================================
       SEARCH, FILTER, SORT, AND RENDER CORE PIPELINE
       ========================================================================== */
    function filterAndRender() {
        // Step 1: Filter Dataset based on Search Input & Select Dropdowns
        filteredDataset = mainDataset.filter(item => {
            // Department Select Filter
            if (state.filterDept && item.department !== state.filterDept) {
                return false;
            }
            
            // Team Select Filter
            if (state.filterTeam && item.team !== state.filterTeam) {
                return false;
            }
            
            // Global Text Search Filter (Exclusively search within Duty/담당업무)
            if (state.searchTerm) {
                const search = state.searchTerm.toLowerCase();
                const matchDuty = (item.duty || '').toLowerCase().includes(search);
                return matchDuty;
            }
            
            return true;
        });
        
        // Update total results badge count
        elements.resultsCount.textContent = filteredDataset.length;
        
        // Step 2: Sort dataset
        if (state.sortColumn) {
            filteredDataset.sort((a, b) => {
                let valA = (a[state.sortColumn] || '').toString();
                let valB = (b[state.sortColumn] || '').toString();
                
                // If it is phone number or ID, sort naturally or numerically
                if (state.sortColumn === 'phone' || state.sortColumn === 'id') {
                    return state.sortDirection === 'asc' 
                        ? valA.localeCompare(valB, undefined, { numeric: true }) 
                        : valB.localeCompare(valA, undefined, { numeric: true });
                }
                
                // Alphabetical Korean/English sorting
                return state.sortDirection === 'asc' 
                    ? valA.localeCompare(valB) 
                    : valB.localeCompare(valA);
            });
        }
        
        // Step 3: Pagination
        const totalItems = filteredDataset.length;
        const totalPages = Math.ceil(totalItems / state.pageSize) || 1;
        
        // Cap current page to total pages bounds
        if (state.currentPage > totalPages) {
            state.currentPage = totalPages;
        }
        if (state.currentPage < 1) {
            state.currentPage = 1;
        }
        
        const startIndex = (state.currentPage - 1) * state.pageSize;
        const endIndex = Math.min(startIndex + state.pageSize, totalItems);
        const paginatedData = filteredDataset.slice(startIndex, endIndex);
        
        // Step 4: Render rows
        renderTableRows(paginatedData, startIndex);
        
        // Step 5: Render pagination controls
        renderPagination(totalPages);
        
        // Toggle empty state card
        if (totalItems === 0) {
            elements.noResultsCard.style.display = 'flex';
            elements.paginationNav.style.display = 'none';
        } else {
            elements.noResultsCard.style.display = 'none';
            elements.paginationNav.style.display = 'flex';
        }
    }

    // Dynamic Row Renderer
    function renderTableRows(data, startIndex) {
        elements.tableBody.innerHTML = '';
        
        data.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', item.id);
            tr.setAttribute('title', '상세 업무 분장 보기');
            
            // Format dynamic row numbering
            const rowNumber = startIndex + index + 1;
            
            // Escaped content
            const deptText = escapeHTML(item.department || '');
            const teamText = escapeHTML(item.team || '');
            const dutyText = item.duty || '';
            const phoneText = escapeHTML(item.phone || '');
            
            // Highlight text if search term exists (only for Duty!)
            const highlightedDuty = highlightText(dutyText, state.searchTerm);
            
            tr.innerHTML = `
                <td class="td-id text-center text-secondary-td" data-label="번호">${rowNumber}</td>
                <td data-label="실과소">${deptText}</td>
                <td data-label="소속 팀" class="text-secondary-td">${teamText}</td>
                <td data-label="담당업무"><div class="duty-summary-cell">${highlightedDuty}</div></td>
                <td data-label="행정번호" class="text-center">
                    <span class="phone-badge-td" data-phone="${item.phone || ''}">${phoneText}</span>
                </td>
                <td class="text-center" data-label="액션">
                    <button class="row-action-btn view-detail-row-btn" data-index="${index}" aria-label="상세 보기" title="상세 분장 정보 보기">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                </td>
            `;
            
            // Double click or single click triggers detail modal (except if clicking phone badge directly)
            tr.addEventListener('click', (e) => {
                if (e.target.closest('.phone-badge-td') || e.target.closest('.row-action-btn')) {
                    return; // Let badge copy / action button events bubble separately
                }
                openDetailModal(item);
            });
            
            // Row action button listener
            tr.querySelector('.view-detail-row-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openDetailModal(item);
            });
            
            // Quick copy on phone badge double click/click
            const phoneBadge = tr.querySelector('.phone-badge-td');
            phoneBadge.addEventListener('click', (e) => {
                e.stopPropagation();
                if (phoneText) {
                    copyToClipboard(phoneText);
                }
            });
            
            elements.tableBody.appendChild(tr);
        });
    }

    // Dynamic Pagination Renderer
    function renderPagination(totalPages) {
        elements.pageNumbersContainer.innerHTML = '';
        
        elements.btnPrevPage.disabled = (state.currentPage === 1);
        elements.btnNextPage.disabled = (state.currentPage === totalPages);
        
        const maxVisibleButtons = 5;
        let startPage = Math.max(1, state.currentPage - Math.floor(maxVisibleButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
        
        if (endPage - startPage + 1 < maxVisibleButtons) {
            startPage = Math.max(1, endPage - maxVisibleButtons + 1);
        }
        
        // Add ellipsis if needed and dynamic page numbers
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-num ${i === state.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                state.currentPage = i;
                filterAndRender();
            });
            elements.pageNumbersContainer.appendChild(pageBtn);
        }
    }

    /* ==========================================================================
       TEXT HIGHLIGHTING UTILITY
       ========================================================================== */
    function highlightText(text, query) {
        if (!query) return escapeHTML(text);
        
        const escapedText = escapeHTML(text);
        // Escape regex special characters in user search query
        const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        
        // Perform case-insensitive matching
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        
        // We use a safe temporary element mapping to prevent double escaping bugs
        return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /* ==========================================================================
       CLIPBOARD & TOAST ALERTS
       ========================================================================== */
    function copyToClipboard(text) {
        // Fallback for non-secure contexts (e.g., file:// protocol in older browsers)
        if (!navigator.clipboard) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed'; // Avoid scrolling to bottom
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    showToast(`행정번호 "${text}" 복사되었습니다.`);
                } else {
                    showToast('복사에 실패했습니다.');
                }
            } catch (err) {
                showToast('복사 중 오류가 발생했습니다.');
            }
            document.body.removeChild(textArea);
            return;
        }
        
        navigator.clipboard.writeText(text)
            .then(() => {
                showToast(`행정번호 "${text}" 복사되었습니다.`);
            })
            .catch(() => {
                showToast('복사에 실패했습니다.');
            });
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-item';
        toast.innerHTML = `
            <div class="toast-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div class="toast-msg">${message}</div>
        `;
        
        elements.toastContainer.appendChild(toast);
        
        // Self-destruction slide out timer
        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 2500);
    }

    /* ==========================================================================
       DETAIL MODAL OPERATIONS
       ========================================================================== */
    function openDetailModal(item) {
        elements.detailDeptBadge.textContent = item.department || '부서 불명';
        elements.detailTeamTitle.textContent = item.team || '팀 없음';
        elements.detailPhoneVal.textContent = item.phone || '번호 없음';
        
        // Format duties list nicely
        const dutiesRaw = item.duty || '';
        elements.detailTasksContent.innerHTML = '';
        
        // Split duties by newline or bullet characters (○, -, •)
        // Then render them as beautiful item list blocks
        const dutiesArray = dutiesRaw
            .split(/\n|○|•|-/)
            .map(d => d.trim())
            .filter(d => d.length > 0);
            
        if (dutiesArray.length === 0) {
            elements.detailTasksContent.innerHTML = '<div class="task-item-bullet">등록된 세부 업무 분장이 없습니다.</div>';
        } else {
            dutiesArray.forEach(duty => {
                const div = document.createElement('div');
                div.className = 'task-item-bullet';
                div.textContent = `○ ${duty}`;
                elements.detailTasksContent.appendChild(div);
            });
        }
        
        // Set phone copy badge action inside detail
        elements.btnDetailPhoneCopy.onclick = () => {
            if (item.phone) copyToClipboard(item.phone);
        };
        
        elements.detailModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Lock main scroll
    }

    function closeDetailModal() {
        elements.detailModal.style.display = 'none';
        document.body.style.overflow = ''; // Unlock main scroll
    }

    /* ==========================================================================
       EXCEL DYNAMIC FILE IMPORTER (SheetJS)
       ========================================================================== */
    function openUploadModal() {
        // Reset modal fields
        elements.fileInput.value = '';
        elements.previewSection.style.display = 'none';
        elements.btnConfirmImport.disabled = true;
        tempImportData = null;
        
        elements.uploadModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeUploadModal() {
        elements.uploadModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    function handleFileSelection(file) {
        if (!file) return;
        
        const fileReader = new FileReader();
        const isCsv = file.name.endsWith('.csv');
        
        fileReader.onload = (e) => {
            try {
                const data = e.target.result;
                let workbook;
                
                if (isCsv) {
                    // For Korean legacy CSVs, character encoding options are critical!
                    // Read with appropriate codepage settings using SheetJS
                    const codepageVal = parseInt(elements.importEncoding.value) || 949;
                    const strContent = new TextDecoder(codepageVal === 949 ? 'cp949' : 'utf-8').decode(data);
                    workbook = XLSX.read(strContent, { type: 'string' });
                } else {
                    // Standard Excel (.xlsx) file parsing is Unicode natively inside zip XMLs
                    const bytes = new Uint8Array(data);
                    workbook = XLSX.read(bytes, { type: 'array' });
                }
                
                // Construct standard format
                const parsedItems = [];
                let globalRowId = 1;
                let sampleHeaderRow = [];
                let sampleRows = [];
                
                // Parse All Sheets in the Excel Workbook
                workbook.SheetNames.forEach((sheetName) => {
                    const sheet = workbook.Sheets[sheetName];
                    const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    
                    if (rawRows.length < 2) {
                        return; // Skip sheets with insufficient data
                    }
                    
                    // Map columns intelligently based on header row names!
                    const headerRow = rawRows[0].map(h => (h || '').toString().trim());
                    
                    if (sampleHeaderRow.length === 0) {
                        sampleHeaderRow = headerRow;
                    }
                    
                    let colIndices = {
                        department: -1,
                        team: -1,
                        duty: -1,
                        phone: -1
                    };
                    
                    headerRow.forEach((name, idx) => {
                        const cleanName = name.toLowerCase();
                        
                        // Exact match priority, followed by flexible substring matches
                        if (cleanName === '실과소' || cleanName.includes('실과소') || cleanName.includes('부서') || cleanName.includes('과') || cleanName.includes('실')) {
                            if (colIndices.department === -1) colIndices.department = idx;
                        }
                        if (cleanName === '소속' || cleanName.includes('소속') || cleanName.includes('팀') || cleanName.includes('담당')) {
                            if (colIndices.team === -1) colIndices.team = idx;
                        }
                        if (cleanName === '담당업무' || cleanName.includes('업무') || cleanName.includes('분장') || cleanName.includes('업무분장') || cleanName.includes('내용')) {
                            if (colIndices.duty === -1) colIndices.duty = idx;
                        }
                        if (cleanName === '행정전화' || cleanName.includes('전화') || cleanName.includes('번호') || cleanName.includes('행정') || cleanName.includes('내선')) {
                            if (colIndices.phone === -1) colIndices.phone = idx;
                        }
                    });
                    
                    // Fallback default index mapping if headers match standard orders:
                    if (colIndices.department === -1) colIndices.department = 0;
                    if (colIndices.team === -1) colIndices.team = 1;
                    if (colIndices.duty === -1) colIndices.duty = 2;
                    if (colIndices.phone === -1) colIndices.phone = 3;
                    
                    for (let r = 1; r < rawRows.length; r++) {
                        const row = rawRows[r];
                        if (!row || row.length === 0) continue;
                        
                        const dept = (colIndices.department !== -1 && row[colIndices.department] !== undefined ? row[colIndices.department] : '').toString().trim();
                        const team = (colIndices.team !== -1 && row[colIndices.team] !== undefined ? row[colIndices.team] : '').toString().trim();
                        const duty = (colIndices.duty !== -1 && row[colIndices.duty] !== undefined ? row[colIndices.duty] : '').toString().trim();
                        const phone = (colIndices.phone !== -1 && row[colIndices.phone] !== undefined ? row[colIndices.phone] : '').toString().trim();
                        
                        if (dept || team || duty || phone) {
                            parsedItems.push({
                                id: globalRowId++,
                                department: dept,
                                team: team,
                                duty: duty,
                                phone: phone
                            });
                            
                            if (sampleRows.length < 5) {
                                sampleRows.push(row);
                            }
                        }
                    }
                });
                
                if (parsedItems.length === 0) {
                    showToast('분석 가능한 데이터가 엑셀 파일 내에 존재하지 않습니다.');
                    return;
                }
                
                // Keep temp reference
                tempImportData = parsedItems;
                
                // Show Import Preview Table
                renderImportPreview(sampleHeaderRow, sampleRows);
                elements.previewRowCount.textContent = parsedItems.length;
                elements.previewSection.style.display = 'block';
                elements.btnConfirmImport.disabled = false;
                
                showToast(`모든 시트에서 총 ${parsedItems.length}건의 데이터를 성공적으로 분석했습니다.`);
                
            } catch (err) {
                console.error(err);
                showToast('엑셀 파일 파싱 중 에러가 발생했습니다.');
            }
        };
        
        if (isCsv) {
            fileReader.readAsArrayBuffer(file); // ArrayBuffer used to support encodings custom decode
        } else {
            fileReader.readAsArrayBuffer(file);
        }
    }

    function renderImportPreview(headers, sampleRows) {
        // Table Head
        elements.previewTableHead.innerHTML = '';
        const trHead = document.createElement('tr');
        headers.slice(0, 5).forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            trHead.appendChild(th);
        });
        elements.previewTableHead.appendChild(trHead);
        
        // Table Body
        elements.previewTableBody.innerHTML = '';
        sampleRows.forEach(row => {
            const tr = document.createElement('tr');
            row.slice(0, 5).forEach(cell => {
                const td = document.createElement('td');
                td.textContent = (cell || '').toString();
                tr.appendChild(td);
            });
            elements.previewTableBody.appendChild(tr);
        });
    }

    function confirmApplyImport() {
        if (!tempImportData || tempImportData.length === 0) return;
        
        const mode = elements.importMode.value;
        if (mode === 'overwrite') {
            mainDataset = tempImportData.map((item, idx) => {
                item.id = idx + 1;
                return item;
            });
            showToast('새로운 데이터셋으로 완전히 교체되었습니다.');
        } else {
            // Append mode
            const startId = mainDataset.length + 1;
            const appended = tempImportData.map((item, idx) => {
                item.id = startId + idx;
                return item;
            });
            mainDataset = [...mainDataset, ...appended];
            showToast(`${tempImportData.length}건의 새로운 데이터를 추가 병합했습니다.`);
        }
        
        // Save to localStorage for data persistence across page reloads/closes
        try {
            localStorage.setItem('pingpong_excel_data', JSON.stringify(mainDataset));
        } catch (err) {
            console.error('Failed to save dataset to localStorage:', err);
            showToast('로컬 저장소 공간이 부족하여 실시간 저장에 실패했습니다.');
        }
        
        // Refresh Stats Dashboard
        calculateStats(mainDataset);
        
        // Refresh Dropdown filter Options
        populateFilters(mainDataset);
        
        // Reset Search
        state.searchTerm = '';
        elements.globalSearch.value = '';
        elements.searchClearBtn.style.display = 'none';
        state.currentPage = 1;
        
        // Re-render
        filterAndRender();
        
        // Close modal
        closeUploadModal();
    }

    /* ==========================================================================
       EXPORT SEARCH RESULTS BACK TO EXCEL (Bonus Premium Feature)
       ========================================================================== */
    function exportFilteredToExcel() {
        if (filteredDataset.length === 0) {
            showToast('다운로드할 검색 결과 데이터가 없습니다.');
            return;
        }
        
        try {
            // Prepare flat structure for SheetJS worksheets
            const exportRows = filteredDataset.map((item, index) => {
                return {
                    '번호': index + 1,
                    '실과소': item.department || '',
                    '소속 팀': item.team || '',
                    '담당업무': item.duty || '',
                    '행정번호': item.phone || ''
                };
            });
            
            const worksheet = XLSX.utils.json_to_sheet(exportRows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, '검색결과');
            
            // Adjust columns width beautifully
            const maxLenCols = [{ wch: 6 }, { wch: 18 }, { wch: 18 }, { wch: 50 }, { wch: 15 }];
            worksheet['!cols'] = maxLenCols;
            
            // Trigger browser save
            XLSX.writeFile(workbook, '행정번호_검색결과_다운로드.xlsx');
            showToast('검색 결과가 엑셀 파일로 다운로드되었습니다.');
        } catch (err) {
            console.error(err);
            showToast('엑셀 내보내기 중 에러가 발생했습니다.');
        }
    }

    /* ==========================================================================
       BINDING REGISTER EVENTS
       ========================================================================== */
    function bindEvents() {
        // Theme Toggle Click
        elements.themeToggleBtn.addEventListener('click', toggleTheme);
        
        // Real-time Unified Text Search Input
        elements.globalSearch.addEventListener('input', (e) => {
            state.searchTerm = e.target.value;
            
            // Toggle clear button display
            if (state.searchTerm) {
                elements.searchClearBtn.style.display = 'block';
            } else {
                elements.searchClearBtn.style.display = 'none';
            }
            
            state.currentPage = 1; // Back to first page on search change
            filterAndRender();
        });

        // Record search history when hitting Enter key
        elements.globalSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const keyword = e.target.value.trim();
                if (keyword) {
                    recordSearchKeyword(keyword);
                    showToast(`"${keyword}" 검색 기록이 인기 검색어에 반영되었습니다.`);
                }
            }
        });
        
        // Search clear click
        elements.searchClearBtn.addEventListener('click', () => {
            elements.globalSearch.value = '';
            state.searchTerm = '';
            elements.searchClearBtn.style.display = 'none';
            state.currentPage = 1;
            filterAndRender();
        });
        
        // Dropdown filter Select lists
        elements.filterDeptSelect.addEventListener('change', (e) => {
            state.filterDept = e.target.value;
            state.currentPage = 1;
            filterAndRender();
        });
        
        elements.filterTeamSelect.addEventListener('change', (e) => {
            state.filterTeam = e.target.value;
            state.currentPage = 1;
            filterAndRender();
        });
        
        // Page size count changer
        elements.pageSizeSelect.addEventListener('change', (e) => {
            state.pageSize = parseInt(e.target.value);
            state.currentPage = 1;
            filterAndRender();
        });
        
        // Pagination Nav Arrow Clicks
        elements.btnPrevPage.addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                filterAndRender();
            }
        });
        
        elements.btnNextPage.addEventListener('click', () => {
            state.currentPage++;
            filterAndRender();
        });
        
        // Sorting Clicks on headers
        elements.tableHeaders.forEach(th => {
            th.addEventListener('click', () => {
                const column = th.getAttribute('data-column');
                
                // Toggle sorting direction if clicking same header, or set standard asc on new header
                if (state.sortColumn === column) {
                    state.sortDirection = (state.sortDirection === 'asc') ? 'desc' : 'asc';
                } else {
                    state.sortColumn = column;
                    state.sortDirection = 'asc';
                }
                
                // Clear other sorting header indicators
                elements.tableHeaders.forEach(otherTh => {
                    otherTh.classList.remove('sort-asc', 'sort-desc');
                });
                
                // Add class indicator to clicked header
                th.classList.add(`sort-${state.sortDirection}`);
                
                filterAndRender();
            });
        });
        
        // Detail Modal Closing Clicks
        elements.detailModalClose.addEventListener('click', closeDetailModal);
        elements.btnDetailClose.addEventListener('click', closeDetailModal);
        
        // Close modal clicking dark background overlay
        elements.detailModal.addEventListener('click', (e) => {
            if (e.target === elements.detailModal) {
                closeDetailModal();
            }
        });
        
        // Excel Upload Triggers and Modal Clicks
        elements.btnUploadTrigger.addEventListener('click', openUploadModal);
        elements.uploadModalClose.addEventListener('click', closeUploadModal);
        elements.btnCancelImport.addEventListener('click', closeUploadModal);
        
        // Reset to original built-in dataset
        if (elements.btnResetOriginal) {
            elements.btnResetOriginal.addEventListener('click', () => {
                if (confirm('업로드한 데이터를 모두 삭제하고 초기 데이터셋으로 복구하시겠습니까?')) {
                    localStorage.removeItem('pingpong_excel_data');
                    showToast('데이터가 초기화되었습니다. 기본 데이터로 다시 로딩합니다.');
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                }
            });
        }
        
        elements.uploadModal.addEventListener('click', (e) => {
            if (e.target === elements.uploadModal) {
                closeUploadModal();
            }
        });
        
        // Trigger file input by clicking drop-zone area
        elements.dropZone.addEventListener('click', () => {
            elements.fileInput.click();
        });
        
        elements.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            handleFileSelection(file);
        });
        
        // Drag and Drop Zone dynamic hover effects
        ['dragenter', 'dragover'].forEach(eventName => {
            elements.dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                elements.dropZone.classList.add('dragover');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            elements.dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                elements.dropZone.classList.remove('dragover');
            }, false);
        });
        
        elements.dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const file = dt.files[0];
            handleFileSelection(file);
        }, false);
        
        // Apply Uploaded Excel Data Trigger Click
        elements.btnConfirmImport.addEventListener('click', confirmApplyImport);
        
        // Export Current Filtered Results Click
        elements.btnExportExcel.addEventListener('click', exportFilteredToExcel);

        // Search Rankings carousel control events
        elements.btnResetRanks.addEventListener('click', resetRanks);
        
        elements.btnPrevRank.addEventListener('click', () => {
            if (rankCarouselPage > 0) {
                rankCarouselPage--;
                updateRankCarouselNav();
            }
        });
        
        elements.btnNextRank.addEventListener('click', () => {
            if (rankCarouselPage < totalRankPages - 1) {
                rankCarouselPage++;
                updateRankCarouselNav();
            }
        });

        // Recalculate ranks carousel paging on browser window resizing
        window.addEventListener('resize', () => {
            // Re-render to adapt pagination items count correctly
            renderSearchRanks();
        });
    }

    // Start App!
    init();
});

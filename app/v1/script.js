/**
 * Ders Değerlendirme Sistemi
 * -------------------------
 * Bu script ders değerlendirme kriterlerini ve öğrenci notlarını
 * yönetmek için kullanılan web uygulamasını kontrol eder.
 * 
 * @version 2.0.0
 * @author Ders Değerlendirme Sistemi Geliştirme Ekibi
 */

'use strict';

// =====================================================
// SABITLER VE GLOBAL DEĞIŞKENLER
// =====================================================

/**
 * Değerlendirme etkinlik türleri
 */
const ACTIVITY_TYPES = {
    term: [
        "Ara Sınav",
        "Laboratuvar Sınavı",
        "Deney",
        "Deney Sonrası Quiz",
        "Performans",
        "Quiz",
        "Rapor",
        "Rapor Sunma",
        "Makale Kritik Etme",
        "Makale Yazma",
        "Proje Hazırlama",
        "Proje Sunma",
        "Rehberli Problem Çözümü",
        "Seminer",
        "Sözlü Sınav",
        "Ödev Problemleri İçin Çalışma",
        "Proje Tasarımı/Yönetimi",
        "Derse Katılım",
        "Ev Ödevi"
    ],
    final: [
        "Final Sınavı",
        "Laboratuvar Ara Sınavı",
        "Makale Yazma",
        "Proje Hazırlama",
        "Proje Sunma",
        "Proje Tasarımı/Yönetimi",
        "Quiz",
        "Rapor",
        "Rapor Hazırlama",
        "Rapor Sunma",
        "Seminer",
        "Sözlü Sınav",
        "Gözlem"
    ],
    subItem: [
        "Soru",
        "Rubrik",
        "Test"
    ]
};

/**
 * Uygulama durum değişkenleri
 */
const APP_STATE = {
    courseData: null,        // Ders bilgileri
    learningOutcomes: [],    // Öğrenme çıktıları
    assessmentTree: [],      // Değerlendirme ağacı
    selectedNode: null,      // Seçili düğüm
	testDetailsNode: null,   // Test detayları için geçici düğüm
    multipleItemsNode: null, // Çoklu öğe eklemek için geçici düğüm
    multipleItemsType: '',   // Eklenecek öğelerin tipi (soru veya rubrik)
    termWeight: 40,          // Yarıyıl içi ağırlığı
    finalWeight: 60,         // Yarıyıl sonu ağırlığı
    jsonFileName: '',        // Yüklenen JSON dosyasının adı
    studentData: [],         // Öğrenci verileri
    gradesData: {},          // Not verileri
    testDetailsNode: null,   // Test detayları için geçici düğüm
    currentActiveTabId: 'definition' // Aktif sekme ID'si
};

// =====================================================
// DOM ELEMENTLERINI SEÇME
// =====================================================

// Ana konteynerler
const treeContainer = document.getElementById('treeContainer');
const outcomesList = document.getElementById('outcomesList');
const courseTitle = document.getElementById('courseTitle');
const courseDetails = document.getElementById('courseDetails');
const courseTerm = document.getElementById('courseTerm');
const termWeightSpan = document.getElementById('termWeight');
const finalWeightSpan = document.getElementById('finalWeight');
const termProgress = document.getElementById('termProgress');
const finalProgress = document.getElementById('finalProgress');

// Modaller
const importModal = document.getElementById('importModal');
const exportModal = document.getElementById('exportModal');
const importStudentsModal = document.getElementById('importStudentsModal');
const exportGradesModal = document.getElementById('exportGradesModal');
const testDetailsModal = document.getElementById('testDetailsModal');
const closeImportModal = document.getElementById('closeImportModal');
const closeExportModal = document.getElementById('closeExportModal');
const closeImportStudentsModal = document.getElementById('closeImportStudentsModal');
const closeExportGradesModal = document.getElementById('closeExportGradesModal');
const closeTestDetailsModal = document.getElementById('closeTestDetailsModal');

const multipleItemsModal = document.getElementById('multipleItemsModal');
const closeMultipleItemsModal = document.getElementById('closeMultipleItemsModal');
const multipleItemsTitle = document.getElementById('multipleItemsTitle');
const itemCount = document.getElementById('itemCount');
const itemType = document.getElementById('itemType');
const questionType = document.getElementById('questionType');
const rubricType = document.getElementById('rubricType');
const questionTypeContainer = document.getElementById('questionTypeContainer');
const rubricTypeContainer = document.getElementById('rubricTypeContainer');
const btnAddMultipleItems = document.getElementById('btnAddMultipleItems');

const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Form ve input elementleri
const jsonContent = document.getElementById('jsonContent');
const exportJsonContent = document.getElementById('exportJsonContent');
const studentJsonContent = document.getElementById('studentJsonContent');
const exportGradesContent = document.getElementById('exportGradesContent');
const fileInput = document.getElementById('fileInput');
const selectedFileName = document.getElementById('selectedFileName');
const selectedStudentFileName = document.getElementById('selectedStudentFileName');
const studentFileInput = document.getElementById('studentFileInput');
const studentJsonInput = document.getElementById('studentJsonInput');
const studentTable = document.getElementById('studentTable');
const assessmentContainer = document.getElementById('assessmentContainer');
const gradesTable = document.getElementById('gradesTable');
const statsContent = document.getElementById('statsContent');
const chartContainer = document.getElementById('chartContainer');
const totalQuestionsInput = document.getElementById('totalQuestions');
const correctWeightInput = document.getElementById('correctWeight');
const wrongPenaltyInput = document.getElementById('wrongPenalty');

// Butonları seçme
const btnImport = document.getElementById('btnImport');
const btnExport = document.getElementById('btnExport');
const btnAddTerm = document.getElementById('btnAddTerm');
const btnAddFinal = document.getElementById('btnAddFinal');
const btnAddQuestion = document.getElementById('btnAddQuestion');
const btnAddRubric = document.getElementById('btnAddRubric');
const btnRemove = document.getElementById('btnRemove');
const btnExpandAll = document.getElementById('btnExpandAll');
const btnCollapseAll = document.getElementById('btnCollapseAll');
const btnSelectFile = document.getElementById('btnSelectFile');
const btnApplyJson = document.getElementById('btnApplyJson');
const btnCopyJson = document.getElementById('btnCopyJson');
const btnSaveJson = document.getElementById('btnSaveJson');
const btnImportStudents = document.getElementById('btnImportStudents');
const btnClearStudents = document.getElementById('btnClearStudents');
const btnSelectStudentFile = document.getElementById('btnSelectStudentFile');
const btnApplyStudentJson = document.getElementById('btnApplyStudentJson');
const btnImportGrades = document.getElementById('btnImportGrades');
const btnSaveGrades = document.getElementById('btnSaveGrades');
const btnSaveGradesToFile = document.getElementById('btnSaveGradesToFile');
const btnExportGradesJSON = document.getElementById('btnExportGradesJSON');
const btnExportGradesExcel = document.getElementById('btnExportGradesExcel');
const btnCalculateGrades = document.getElementById('btnCalculateGrades');
const btnExportFinalGrades = document.getElementById('btnExportFinalGrades');
const btnCopyGrades = document.getElementById('btnCopyGrades');
const btnSaveTestDetails = document.getElementById('btnSaveTestDetails');

// =====================================================
// YARDIMCI FONKSIYONLAR
// =====================================================

/**
 * ID'ye göre düğüm bulma
 * @param {string} id - Aranacak düğüm ID'si
 * @returns {Object|null} - Bulunan düğüm veya null
 */
function findNodeById(id) {
    // Yardımcı iç fonksiyon
    const searchNode = (node) => {
        if (node.id === id) return node;
        
        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                const found = searchNode(child);
                if (found) return found;
            }
        }
        
        return null;
    };
    
    // Tüm ağaçta ara
    for (const rootNode of APP_STATE.assessmentTree) {
        const found = searchNode(rootNode);
        if (found) return found;
    }
    
    return null;
}

/**
 * Harf notunu hesaplama
 * @param {number} totalGrade - Toplam not
 * @returns {string} - Harf notu
 */
function getLetterGrade(totalGrade) {
    if (totalGrade >= 90) return 'AA';
    if (totalGrade >= 85) return 'BA';
    if (totalGrade >= 80) return 'BB';
    if (totalGrade >= 75) return 'CB';
    if (totalGrade >= 70) return 'CC';
    if (totalGrade >= 60) return 'DC';
    if (totalGrade >= 50) return 'DD';
    if (totalGrade >= 40) return 'FD';
    return 'FF';
}

/**
 * Rastgele öğrenme çıktıları alma
 * @param {number} count - İstenilen çıktı sayısı
 * @returns {Array} - Rastgele öğrenme çıktıları ID'leri
 */
function getRandomOutcomes(count) {
    if (!APP_STATE.learningOutcomes || APP_STATE.learningOutcomes.length === 0) {
        return [];
    }
    
    // Öğrenme çıktılarından rastgele seç
    const outcomes = [];
    const availableOutcomes = [...APP_STATE.learningOutcomes];
    
    for (let i = 0; i < Math.min(count, availableOutcomes.length); i++) {
        const randomIndex = Math.floor(Math.random() * availableOutcomes.length);
        outcomes.push(availableOutcomes[randomIndex].id);
        availableOutcomes.splice(randomIndex, 1);
    }
    
    return outcomes;
}

/**
 * Alt düğümlerin öğrenme çıktılarını toplama
 * @param {Array} children - Alt düğümler
 * @param {Set} outcomeSet - Öğrenme çıktıları set'i
 */
function collectChildOutcomes(children, outcomeSet) {
    children.forEach(child => {
        if (child.outcomes && child.outcomes.length) {
            child.outcomes.forEach(outcome => outcomeSet.add(outcome));
        }
        
        if (child.children && child.children.length > 0) {
            collectChildOutcomes(child.children, outcomeSet);
        }
    });
}

/**
 * Seçili sekmeyi değiştirme
 * @param {string} tabId - Sekme ID'si
 */
function switchTab(tabId) {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.nav-content');
    
    // Önce tüm tabları pasif yap
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // Seçili tabı aktif yap
    const selectedTab = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
    const selectedContent = document.getElementById(`${tabId}-content`);
    
    if (selectedTab && selectedContent) {
        selectedTab.classList.add('active');
        selectedContent.classList.add('active');
        selectedContent.style.display = 'block';
        APP_STATE.currentActiveTabId = tabId;
    }
}

/**
 * Modali açma fonksiyonu
 * @param {HTMLElement} modal - Açılacak modal elementi
 */
function openModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * Modali kapatma fonksiyonu
 * @param {HTMLElement} modal - Kapatılacak modal elementi
 */
function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Tarihi okunabilir formata çevirme
 * @param {string} isoDate - ISO formatlı tarih
 * @returns {string} - Formatlanmış tarih
 */
function formatDate(isoDate) {
    if (!isoDate) return '';
    
    const date = new Date(isoDate);
    return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Dosya adından uzantıyı çıkarma
 * @param {string} filename - Dosya adı
 * @returns {string} - Uzantısız dosya adı
 */
function removeExtension(filename) {
    if (!filename) return '';
    return filename.replace(/\.[^/.]+$/, "");
}

// =====================================================
// AĞAÇ VE DEĞERLENDİRME FONKSİYONLARI
// =====================================================

/**
 * Düğüm seçme
 * @param {Object} node - Seçilecek düğüm
 */
function selectNode(node) {
    APP_STATE.selectedNode = node;
    renderTree();
}

/**
 * Yarıyıl içi etkinlik ekleme
 */
function addTermActivity() {
    try {
        // Mevcut yarıyıl içi etkinlikleri say
        const termCount = APP_STATE.assessmentTree.filter(node => node.id.startsWith('A')).length;
        const newId = `A${termCount + 1}`;
        const newNode = {
            id: newId,
            name: 'Yarıyıl İçi Etkinlik',
            type: ACTIVITY_TYPES.term[0],
            weight: 0,
            points: 100,
            outcomes: [],
            description: 'Yarıyıl içi değerlendirme',
            expanded: true,
            children: []
        };
        
        // Yarıyıl içi etkinliklerini başa ekleyin
        // Var olan yarıyıl içi etkinliklerini bul
        const termNodes = APP_STATE.assessmentTree.filter(node => node.id.startsWith('A'));
        
        // Diğer tüm etkinlikleri al
        const otherNodes = APP_STATE.assessmentTree.filter(node => !node.id.startsWith('A'));
        
        // Yeni düğümü yarıyıl içi etkinliklerine ekle
        termNodes.push(newNode);
        
        // Ağacı güncelle - önce tüm yarıyıl içi, sonra diğer etkinlikler
        APP_STATE.assessmentTree = [...termNodes, ...otherNodes];
        
        selectNode(newNode);
        renderTree();
        
        // Değerlendirme sekmesini güncelle
        updateAssessmentView();
        
        showModernToast("Yarıyıl içi etkinlik eklendi.");
		
		if (confirm("Yarıyıl içi etkinliğe soru veya rubrik eklemek ister misiniz?")) {
            showMultipleItemsModal('soru');
        }
		
    } catch (error) {
        console.error("Yarıyıl içi etkinlik eklenirken hata oluştu:", error);
        showModernToast("Yarıyıl içi etkinlik eklenemedi!", "error");
    }
}

/**
 * Yarıyıl sonu etkinlik ekleme
 */
function addFinalActivity() {
    try {
        // Mevcut yarıyıl sonu etkinlikleri say
        const finalCount = APP_STATE.assessmentTree.filter(node => node.id.startsWith('F')).length;
        const newId = `F${finalCount + 1}`;
        const newNode = {
            id: newId,
            name: 'Yarıyıl Sonu Etkinlik',
            type: ACTIVITY_TYPES.final[0],
            weight: 0,
            points: 100,
            outcomes: [],
            description: 'Yarıyıl sonu değerlendirme',
            expanded: true,
            children: []
        };
        
        // Yarıyıl sonu etkinliklerini sona ekle
        APP_STATE.assessmentTree.push(newNode);
        
        selectNode(newNode);
        renderTree();
        
        // Değerlendirme sekmesini güncelle
        updateAssessmentView();
        
        showModernToast("Yarıyıl sonu etkinlik eklendi.");
		
		if (confirm("Yarıyıl sonu etkinliğe soru veya rubrik eklemek ister misiniz?")) {
            showMultipleItemsModal('soru');
        }
		
    } catch (error) {
        console.error("Yarıyıl sonu etkinlik eklenirken hata oluştu:", error);
        showModernToast("Yarıyıl sonu etkinlik eklenemedi!", "error");
    }
}

/**
 * Düğüme soru ekleme
 * @param {Object} parentNode - Üst düğüm
 * @param {string} questionType - Soru tipi
 * @param {string} description - Açıklama
 */
/**
 * Düğüme soru ekleme
 * @param {Object} parentNode - Üst düğüm
 * @param {string} questionType - Soru tipi
 * @param {string} description - Açıklama
 */
function addQuestionToNode(parentNode, questionType = 'Soru', description = '') {
    if (!parentNode) return;
    
    try {
        if (!parentNode.children) {
            parentNode.children = [];
        }
        
        const childCount = parentNode.children.length;
        const newId = `${parentNode.id}.${childCount + 1}`;
        
        // Öğrenme çıktıları varsa ilk öğrenme çıktısını atayalım
        const outcome = parentNode.outcomes.length > 0 ? [parentNode.outcomes[0]] : [];
        
        // Varsayılan puanı 3 olarak ayarla (önceki 20 yerine)
        const defaultPoints = 3;
        
        const newNode = {
            id: newId,
            name: `${questionType}`,
            type: questionType,
            weight: 0, // Ağırlık otomatik hesaplanacak
            points: defaultPoints, // Varsayılan puan 3
            outcomes: outcome,
            description: description || 'Değerlendirme sorusu',
            expanded: true,
            children: []
        };
        
        parentNode.children.push(newNode);
        parentNode.expanded = true;
        
        // Ağırlığı hesapla
        updateSubItemWeight(newNode);
        
        selectNode(newNode);
        renderTree();
        
        // Değerlendirme sekmesini güncelle
        updateAssessmentView();
        
        showModernToast(`"${questionType}" sorusu eklendi.`);
        
        // YENİ KOD: Ağırlıkları yeniden değerlendir
        checkAndOfferRedistribution(parentNode);
        
    } catch (error) {
        console.error("Soru eklenirken hata oluştu:", error);
        showModernToast("Soru eklenemedi!", "error");
    }
}

/**
 * Düğüme test ekleme (toplu çoktan seçmeli sorular)
 * @param {Object} parentNode - Üst düğüm
 */
function addTestToNode(parentNode) {
    if (!parentNode) return;
    
    try {
        if (!parentNode.children) {
            parentNode.children = [];
        }
        
        const childCount = parentNode.children.length;
        const newId = `${parentNode.id}.${childCount + 1}`;
        
        // Öğrenme çıktıları varsa ilk öğrenme çıktısını atayalım
        const outcome = parentNode.outcomes.length > 0 ? [parentNode.outcomes[0]] : [];
        
        const newNode = {
            id: newId,
            name: "Test Soruları",
            type: "Test",
            weight: 20, // Varsayılan ağırlık
            points: 100, // Varsayılan toplam puan
            outcomes: outcome,
            description: "Çoktan seçmeli test soruları",
            expanded: true,
            children: [],
            testDetails: {
                totalQuestions: 20,
                correctWeight: 5,
                wrongPenalty: 0
            }
        };
        
        parentNode.children.push(newNode);
        parentNode.expanded = true;
        selectNode(newNode);
        renderTree();
        
        // Değerlendirme sekmesini güncelle
        updateAssessmentView();
        
        // Test detayları için modal göster
        APP_STATE.testDetailsNode = newNode;
        showTestDetailsModal();
        
        showModernToast("Test soruları eklendi.");
    } catch (error) {
        console.error("Test eklenirken hata oluştu:", error);
        showModernToast("Test eklenemedi!", "error");
    }
}

/**
 * Test detayları modalını gösterme
 */
function showTestDetailsModal() {
    if (!APP_STATE.testDetailsNode) return;
    
    const node = APP_STATE.testDetailsNode;
    
    totalQuestionsInput.value = node.testDetails?.totalQuestions || 20;
    correctWeightInput.value = node.testDetails?.correctWeight || 5;
    wrongPenaltyInput.value = node.testDetails?.wrongPenalty || 0;
    
    openModal(testDetailsModal);
}

/**
 * Test detaylarını kaydetme
 */
function saveTestDetails() {
    if (!APP_STATE.testDetailsNode) return;
    
    try {
        const totalQuestions = parseInt(totalQuestionsInput.value) || 20;
        const correctWeight = parseFloat(correctWeightInput.value) || 5;
        const wrongPenalty = parseFloat(wrongPenaltyInput.value) || 0;
        
        APP_STATE.testDetailsNode.testDetails = {
            totalQuestions,
            correctWeight,
            wrongPenalty
        };
        
        // Toplam puanı hesapla
        APP_STATE.testDetailsNode.points = totalQuestions * correctWeight;
        
        // Ağacı yeniden render et
        renderTree();
        
        // Değerlendirme sekmesini güncelle
        updateAssessmentView();
        
        // Modalı kapat
        closeModal(testDetailsModal);
        
        showModernToast("Test detayları kaydedildi.");
    } catch (error) {
        console.error("Test detayları kaydedilirken hata oluştu:", error);
        showModernToast("Test detayları kaydedilemedi!", "error");
    }
}

/**
 * Düğüme rubrik ekleme
 * @param {Object} parentNode - Üst düğüm
 * @param {string} rubricType - Rubrik tipi
 * @param {string} description - Açıklama
 */
/**
 * Düğüme rubrik ekleme
 * @param {Object} parentNode - Üst düğüm
 * @param {string} rubricType - Rubrik tipi
 * @param {string} description - Açıklama
 */
function addRubricToNode(parentNode, rubricType = 'Rubrik', description = '') {
    if (!parentNode) return;
    
    try {
        if (!parentNode.children) {
            parentNode.children = [];
        }
        
        const childCount = parentNode.children.length;
        const newId = `${parentNode.id}.${childCount + 1}`;
        
        // Öğrenme çıktıları varsa ilk öğrenme çıktısını atayalım
        const outcome = parentNode.outcomes.length > 0 ? [parentNode.outcomes[0]] : [];
        
        // Varsayılan puanı 3 olarak ayarla (önceki 20 yerine)
        const defaultPoints = 3;
        
        const newNode = {
            id: newId,
            name: `${rubricType}`,
            type: 'Rubrik',
            weight: 0, // Ağırlık otomatik hesaplanacak
            points: defaultPoints, // Varsayılan puan 3
            outcomes: outcome,
            description: description || 'Değerlendirme kriteri',
            expanded: true,
            children: []
        };
        
        parentNode.children.push(newNode);
        parentNode.expanded = true;
        
        // Ağırlığı hesapla
        updateSubItemWeight(newNode);
        
        selectNode(newNode);
        renderTree();
        
        // Değerlendirme sekmesini güncelle
        updateAssessmentView();
        
        showModernToast(`"${rubricType}" rubriği eklendi.`);
        
        // YENİ KOD: Ağırlıkları yeniden değerlendir
        checkAndOfferRedistribution(parentNode);
        
    } catch (error) {
        console.error("Rubrik eklenirken hata oluştu:", error);
        showModernToast("Rubrik eklenemedi!", "error");
    }
}

/**
 * Soru ekleme fonksiyonu
 * Bir etkinliğe soru eklemek için kullanılır
 */
function addQuestion() {
    if (!APP_STATE.selectedNode) {
        showModernToast("Lütfen önce bir etkinlik seçin.", "warning");
        return;
    }
    
    // Seçili düğüm kök değilse alt düğüm eklenmemeli
    if (APP_STATE.selectedNode.id.includes('.')) {
        showModernToast("Sorular sadece ana etkinliklere eklenebilir.", "warning");
        return;
    }
    
    // Çoklu soru eklemek için modal göster
    // Bu satırı yorum haline getirip doğrudan ekleme de yapabilirsiniz
    showMultipleItemsModal('soru');
    
    /* 
    // Tek soru eklemek için bu kısmı kullanabilirsiniz
    addQuestionToNode(APP_STATE.selectedNode);
    */
}

/**
 * Rubrik ekleme fonksiyonu
 * Bir etkinliğe rubrik eklemek için kullanılır
 */
function addRubric() {
    if (!APP_STATE.selectedNode) {
        showModernToast("Lütfen önce bir etkinlik seçin.", "warning");
        return;
    }
    
    // Seçili düğüm kök değilse alt düğüm eklenmemeli
    if (APP_STATE.selectedNode.id.includes('.')) {
        showModernToast("Rubrikler sadece ana etkinliklere eklenebilir.", "warning");
        return;
    }
    
    // Çoklu rubrik eklemek için modal göster
    showMultipleItemsModal('rubrik');
    
    /* 
    // Tek rubrik eklemek için bu kısmı kullanabilirsiniz
    addRubricToNode(APP_STATE.selectedNode);
    */
}

/**
 * Düğüm silme
 */
function removeNode() {
    if (!APP_STATE.selectedNode) {
        showModernToast("Lütfen önce bir etkinlik seçin.", "warning");
        return;
    }
    
    showDeleteConfirmModal(
        function() {
            try {
                // Kök düğüm mü kontrol et
                const isRoot = !APP_STATE.selectedNode.id.includes('.');
                
                if (isRoot) {
                    // Kök düğümü sil
                    const index = APP_STATE.assessmentTree.findIndex(node => node.id === APP_STATE.selectedNode.id);
                    if (index !== -1) {
                        APP_STATE.assessmentTree.splice(index, 1);
                    }
                } else {
                    // Alt düğümü sil
                    const parentId = APP_STATE.selectedNode.id.substring(0, APP_STATE.selectedNode.id.lastIndexOf('.'));
                    const findParentAndRemoveChild = (nodes, id) => {
                        for (let i = 0; i < nodes.length; i++) {
                            const node = nodes[i];
                            if (node.id === parentId && node.children) {
                                const childIndex = node.children.findIndex(child => child.id === id);
                                if (childIndex !== -1) {
                                    node.children.splice(childIndex, 1);
                                    return true;
                                }
                            }
                            
                            if (node.children && node.children.length > 0) {
                                if (findParentAndRemoveChild(node.children, id)) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    };
                    
                    findParentAndRemoveChild(APP_STATE.assessmentTree, APP_STATE.selectedNode.id);
                }
                
                APP_STATE.selectedNode = null;
                renderTree();
                
                // Değerlendirme sekmesini güncelle
                updateAssessmentView();
                
                showModernToast("Etkinlik başarıyla silindi.");
            } catch (error) {
                console.error("Düğüm silinirken hata oluştu:", error);
                showModernToast("Etkinlik silinemedi!", "error");
            }
        },
        `"${APP_STATE.selectedNode.name}" etkinliğini ve tüm alt öğelerini silmek istediğinizden emin misiniz?`
    );
}

/**
 * Tüm düğümleri genişlet
 */
function expandAll() {
    const expandNodes = (nodes) => {
        nodes.forEach(node => {
            node.expanded = true;
            if (node.children && node.children.length > 0) {
                expandNodes(node.children);
            }
        });
    };
    
    expandNodes(APP_STATE.assessmentTree);
    renderTree();
    showModernToast("Tüm etkinlikler genişletildi.");
}

/**
 * Tüm düğümleri daralt
 */
function collapseAll() {
    const collapseNodes = (nodes) => {
        nodes.forEach(node => {
            node.expanded = false;
            if (node.children && node.children.length > 0) {
                collapseNodes(node.children);
            }
        });
    };
    
    collapseNodes(APP_STATE.assessmentTree);
    renderTree();
    showModernToast("Tüm etkinlikler daraltıldı.");
}

/**
 * Öğrenme çıktılarını güncelleme
 * @param {Object} node - Güncellenecek düğüm
 * @param {HTMLInputElement} outcomesInput - Çıktılar input elementi
 */
function updateOutcomes(node, outcomesInput) {
    try {
        const inputValue = outcomesInput.value.trim();
        
        // Alt düğüm ise (soru veya rubrik), sadece bir ÖÇ atanabilsin
        const isSubItem = node.id.includes('.');
        
        if (isSubItem) {
            const outcomes = inputValue.split(',').map(s => s.trim()).filter(s => s);
            
            if (outcomes.length > 1) {
                showModernToast("Soru veya Rubrik sadece bir Öğrenme Çıktısına atanabilir!", "warning");
                // İlk öğrenme çıktısını al
                node.outcomes = outcomes.slice(0, 1);
                outcomesInput.value = node.outcomes.join(',');
            } else {
                node.outcomes = outcomes;
            }
        } else {
            // Ana etkinlik için birden çok ÖÇ atanabilir
            node.outcomes = inputValue.split(',').map(s => s.trim()).filter(s => s);
        }
        
        // Alt düğümlerin öğrenme çıktılarını ana düğüme kopyala
        if (!isSubItem && node.children && node.children.length > 0) {
            const childOutcomes = new Set();
            collectChildOutcomes(node.children, childOutcomes);
            
            // Eğer childOutcomes boş değilse, ana düğümün outcomes'ını güncelle
            if (childOutcomes.size > 0) {
                node.outcomes = Array.from(childOutcomes);
                outcomesInput.value = node.outcomes.join(',');
            }
        }
    } catch (error) {
        console.error("Öğrenme çıktıları güncellenirken hata oluştu:", error);
        showModernToast("Öğrenme çıktıları güncellenemedi!", "error");
    }
}

/**
 * Kategori ağırlıklarını güncelleme
 */
/**
 * Kategori ağırlıklarını güncelleme
 */
function updateCategoryWeights() {
    try {
        // Yarıyıl içi ve yarıyıl sonu etkinlikleri ayır
        const termActivities = APP_STATE.assessmentTree.filter(node => node.id.startsWith('A'));
        const finalActivities = APP_STATE.assessmentTree.filter(node => node.id.startsWith('F'));
        
        // Her kategori içinde toplam ağırlıkları hesapla
        const termInternalTotal = termActivities.reduce((sum, node) => sum + parseFloat(node.weight || 0), 0);
        const finalInternalTotal = finalActivities.reduce((sum, node) => sum + parseFloat(node.weight || 0), 0);
        
        // Sabit tanımlı genel değerlendirme ağırlıkları - JSON'dan geliyor, değişmez
        const termContribution = APP_STATE.courseData?.dersDegerlendirme?.genelDegerlendirme?.find(
            item => item.degerlendirme.includes("İçi"))?.katkiYuzdesi || 40;
        const finalContribution = APP_STATE.courseData?.dersDegerlendirme?.genelDegerlendirme?.find(
            item => item.degerlendirme.includes("Sonu"))?.katkiYuzdesi || 60;
        
        // Genel ağırlıkları kaydet
        APP_STATE.termWeight = termContribution;  
        APP_STATE.finalWeight = finalContribution;
        
        // Bu değerler değişmez - sabit kalmalı
        document.getElementById('termGeneralWeight').textContent = termContribution;
        document.getElementById('finalGeneralWeight').textContent = finalContribution;
        
        // İç ağırlık toplamları güncellenir
        document.getElementById('termInternalTotal').textContent = termInternalTotal;
        document.getElementById('finalInternalTotal').textContent = finalInternalTotal;
        
        // İç toplamlar 100% değilse uyarı rengiyle göster
        if (termInternalTotal !== 100) {
            document.getElementById('termInternalTotal').style.color = 'var(--danger-color)';
        } else {
            document.getElementById('termInternalTotal').style.color = '';
        }
        
        if (finalInternalTotal !== 100) {
            document.getElementById('finalInternalTotal').style.color = 'var(--danger-color)';
        } else {
            document.getElementById('finalInternalTotal').style.color = '';
        }
        
        // Progress barları sadece gösterim amaçlı
        termProgress.style.width = `${termInternalTotal}%`;
        finalProgress.style.width = `${finalInternalTotal}%`;
        
        // Course Data'yı güncelle
        if (APP_STATE.courseData && APP_STATE.courseData.dersDegerlendirme) {
            // Yarıyıl içi etkinliklerini güncelle
            APP_STATE.courseData.dersDegerlendirme.yariyilIciEtkinlikleri = termActivities.map(node => ({
                "etkinlik": node.type,
                "sayi": 1,
                "katkiYuzdesi": node.weight,
                "id": node.id
            }));
            
            // Yarıyıl sonu etkinliklerini güncelle
            APP_STATE.courseData.dersDegerlendirme.yariyilSonuEtkinlikleri = finalActivities.map(node => ({
                "etkinlik": node.type,
                "sayi": 1,
                "katkiYuzdesi": node.weight,
                "id": node.id
            }));
            
            // Toplamları güncelle
            APP_STATE.courseData.dersDegerlendirme.yariyilIciToplam = termInternalTotal;
            APP_STATE.courseData.dersDegerlendirme.yariyilSonuToplam = finalInternalTotal;
            // Genel değerlendirme değişmez (40-60)
        }
    } catch (error) {
        console.error("Kategori ağırlıkları güncellenirken hata oluştu:", error);
    }
}

// =====================================================
// RENDER VE UI GÜNCELLEME FONKSIYONLARI
// =====================================================

/**
 * Düğüm render etme fonksiyonunu güncelleyelim
 * @param {Object} node - Render edilecek düğüm
 * @param {HTMLElement} parentElement - Üst element
 * @param {number} level - Düğüm seviyesi
 */
function renderNode(node, parentElement, level) {
    try {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'tree-node';
        nodeElement.dataset.id = node.id;
        nodeElement.dataset.nodetype = node.type; // Tip bilgisini veri özniteliği olarak sakla
        
        // Düğüm tipine göre stil ekle
        if (node.id.startsWith('A')) {
            nodeElement.classList.add('term-type');
        } else if (node.id.startsWith('F')) {
            nodeElement.classList.add('final-type');
        } else if (node.type === 'Soru' || node.type.includes('Soru') || isQuestionType(node.type)) {
            nodeElement.classList.add('question-type');
        } else if (node.type === 'Rubrik' || node.type.includes('Rubrik') || isRubricType(node.type)) {
            nodeElement.classList.add('rubric-type');
        } else if (node.type === 'Test') {
            nodeElement.classList.add('question-type');
        }
        
        if (APP_STATE.selectedNode && APP_STATE.selectedNode.id === node.id) {
            nodeElement.classList.add('selected');
        }
        
        // Düğüm tipine göre seçenekler oluştur
        let typeOptions = generateTypeOptions(node);
        
        // Soru veya Rubrik için ağırlık alanını readonly yapmak
        const isSubItem = node.id.includes('.');
        const isQuestionOrRubric = node.type === 'Soru' || node.type.includes('Soru') || isQuestionType(node.type) || 
                               node.type === 'Rubrik' || node.type.includes('Rubrik') || isRubricType(node.type) ||
                               node.type === 'Test';
        
        const isWeightReadonly = isSubItem && isQuestionOrRubric;
        
        // Düğüm HTML içeriği oluştur
        nodeElement.innerHTML = `
            <div class="toggle">${node.children && node.children.length > 0 ? (node.expanded ? '▼' : '▶') : '•'}</div>
            <div>${node.id}</div>
            <div><input type="text" value="${node.name || ''}" placeholder="Etkinlik adı" class="nodeName"></div>
            <div>
                <select class="nodeType" data-current-type="${node.type}">
                    ${typeOptions}
                </select>
            </div>
            <div><input type="number" value="${node.weight || 0}" min="0" max="100" class="nodeWeight" ${isWeightReadonly ? 'readonly' : ''}></div>
            <div><input type="number" value="${node.points || 0}" min="0" class="nodePoints"></div>
            <div><input type="text" value="${(node.outcomes || []).join(',')}" placeholder="ÖÇ.1,ÖÇ.2,..." class="nodeOutcomes"></div>
            <div>
                <input type="text" value="${node.description || ''}" placeholder="Açıklama..." class="nodeDescription">
                <button class="btn-delete-node" data-node-id="${node.id}" title="Sil">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        
        // Düğüme olay dinleyicileri ekle
        nodeElement.addEventListener('click', (e) => {
            if (!e.target.closest('input') && !e.target.closest('select') && !e.target.closest('button')) {
                selectNode(node);
            }
        });
        
        const toggle = nodeElement.querySelector('.toggle');
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            node.expanded = !node.expanded;
            renderTree();
        });
        
        // Silme butonu için olay dinleyicisi
        const deleteButton = nodeElement.querySelector('.btn-delete-node');
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteNode(node.id);
        });
        
        // Input değerlerini güncelleme
        const nameInput = nodeElement.querySelector('.nodeName');
        nameInput.addEventListener('change', () => {
            node.name = nameInput.value;
            // Değerlendirme sekmesini güncelle
            updateAssessmentView();
        });
        
        const typeSelect = nodeElement.querySelector('.nodeType');
        typeSelect.addEventListener('change', () => {
            const oldType = node.type;
            const newType = typeSelect.value;
            
            // Tip değişimini kaydet
            node.type = newType;
            
            // Değerlendirme sekmesini güncelle
            updateAssessmentView();
            
            // Soru ve Rubrik ana tipleri arasındaki geçişleri özel ele al
            const isMainTypeChange = (
                (isQuestionMainType(oldType) && (newType === 'Rubrik' || isRubricType(newType))) ||
                ((oldType === 'Rubrik' || isRubricType(oldType)) && isQuestionMainType(newType))
            );
            
            // Eğer ana tür değişimi varsa tüm ağacı yeniden render et
            if (isMainTypeChange) {
                renderTree();
            } else {
                // Alt türler arası geçişlerde sadece ilgili sınıfları güncelle
                updateNodeClassesAfterTypeChange(nodeElement, oldType, newType);
            }
        });
        
        const weightInput = nodeElement.querySelector('.nodeWeight');
        weightInput.addEventListener('change', () => {
            if (!isWeightReadonly) {
                node.weight = parseInt(weightInput.value) || 0;
                updateCategoryWeights();
                // Değerlendirme sekmesini güncelle
                updateAssessmentView();
            }
        });
        
        const pointsInput = nodeElement.querySelector('.nodePoints');
        pointsInput.addEventListener('change', () => {
            node.points = parseInt(pointsInput.value) || 0;
            
            // Eğer bu bir soru/rubrik alt öğesi ise, ağırlığı otomatik hesapla
            if (isSubItem && isQuestionOrRubric) {
                updateSubItemWeight(node);
            }
            
            // Değerlendirme sekmesini güncelle
            updateAssessmentView();
        });
        
        const outcomesInput = nodeElement.querySelector('.nodeOutcomes');
        outcomesInput.addEventListener('change', () => {
            updateOutcomes(node, outcomesInput);
            // Değerlendirme sekmesini güncelle
            updateAssessmentView();
        });
        
        const descriptionInput = nodeElement.querySelector('.nodeDescription');
        descriptionInput.addEventListener('change', () => {
            node.description = descriptionInput.value;
        });
        
        // Düğümü parent'a ekle
        parentElement.appendChild(nodeElement);
        
        // Alt düğümleri render et
        if (node.children && node.children.length > 0 && node.expanded) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'node-children';
            parentElement.appendChild(childrenContainer);
            
            node.children.forEach(child => {
                renderNode(child, childrenContainer, level + 1);
            });
        }
    } catch (error) {
        console.error("Düğüm render edilirken hata oluştu:", error);
        showModernToast("Değerlendirme bileşenleri görüntülenirken hata oluştu!", "error");
    }
}

/**
 * Alt öğelerin (soru/rubrik) ağırlığını otomatik hesaplama
 * @param {Object} node - Ağırlığı hesaplanacak düğüm
 */
function updateSubItemWeight(node) {
    try {
        // Üst düğümü bul
        const parentId = node.id.substring(0, node.id.lastIndexOf('.'));
        const parentNode = findNodeById(parentId);
        
        if (!parentNode || !parentNode.children || parentNode.children.length === 0) {
            return;
        }
        
        // Toplam puan hesapla
        const totalPoints = parentNode.children.reduce((sum, child) => sum + (parseInt(child.points) || 0), 0);
        
        // Her çocuk için ağırlık hesapla
        if (totalPoints > 0) {
            parentNode.children.forEach(child => {
                const childPoints = parseInt(child.points) || 0;
                child.weight = Math.round((childPoints / totalPoints) * 100);
                
                // DOM'da ağırlık alanını güncelle
                const weightInput = document.querySelector(`.tree-node[data-id="${child.id}"] .nodeWeight`);
                if (weightInput) {
                    weightInput.value = child.weight;
                }
            });
        }
        
        // Kategori ağırlıklarını güncelle
        updateCategoryWeights();
    } catch (error) {
        console.error("Alt öğe ağırlığı hesaplanırken hata oluştu:", error);
    }
}

/**
 * Düğüme soru ekleme
 * @param {Object} parentNode - Üst düğüm
 * @param {string} questionType - Soru tipi
 * @param {string} description - Açıklama
 */
function addQuestionToNode(parentNode, questionType = 'Soru', description = '') {
    if (!parentNode) return;
    
    try {
        if (!parentNode.children) {
            parentNode.children = [];
        }
        
        const childCount = parentNode.children.length;
        const newId = `${parentNode.id}.${childCount + 1}`;
        
        // Öğrenme çıktıları varsa ilk öğrenme çıktısını atayalım
        const outcome = parentNode.outcomes.length > 0 ? [parentNode.outcomes[0]] : [];
        
        // Varsayılan puanı 3 olarak ayarla (önceki 20 yerine)
        const defaultPoints = 3;
        
        const newNode = {
            id: newId,
            name: `${questionType}`,
            type: questionType,
            weight: 0, // Ağırlık otomatik hesaplanacak
            points: defaultPoints, // Varsayılan puan 3
            outcomes: outcome,
            description: description || 'Değerlendirme sorusu',
            expanded: true,
            children: []
        };
        
        parentNode.children.push(newNode);
        parentNode.expanded = true;
        
        // Ağırlığı hesapla
        updateSubItemWeight(newNode);
        
        selectNode(newNode);
        renderTree();
        
        // Değerlendirme sekmesini güncelle
        updateAssessmentView();
        
        showModernToast(`"${questionType}" sorusu eklendi.`);
    } catch (error) {
        console.error("Soru eklenirken hata oluştu:", error);
        showModernToast("Soru eklenemedi!", "error");
    }
}

/**
 * Düğüme rubrik ekleme
 * @param {Object} parentNode - Üst düğüm
 * @param {string} rubricType - Rubrik tipi
 * @param {string} description - Açıklama
 */
function addRubricToNode(parentNode, rubricType = 'Rubrik', description = '') {
    if (!parentNode) return;
    
    try {
        if (!parentNode.children) {
            parentNode.children = [];
        }
        
        const childCount = parentNode.children.length;
        const newId = `${parentNode.id}.${childCount + 1}`;
        
        // Öğrenme çıktıları varsa ilk öğrenme çıktısını atayalım
        const outcome = parentNode.outcomes.length > 0 ? [parentNode.outcomes[0]] : [];
        
        // Varsayılan puanı 3 olarak ayarla (önceki 20 yerine)
        const defaultPoints = 3;
        
        const newNode = {
            id: newId,
            name: `${rubricType}`,
            type: 'Rubrik',
            weight: 0, // Ağırlık otomatik hesaplanacak
            points: defaultPoints, // Varsayılan puan 3
            outcomes: outcome,
            description: description || 'Değerlendirme kriteri',
            expanded: true,
            children: []
        };
        
        parentNode.children.push(newNode);
        parentNode.expanded = true;
        
        // Ağırlığı hesapla
        updateSubItemWeight(newNode);
        
        selectNode(newNode);
        renderTree();
        
        // Değerlendirme sekmesini güncelle
        updateAssessmentView();
        
        showModernToast(`"${rubricType}" rubriği eklendi.`);
    } catch (error) {
        console.error("Rubrik eklenirken hata oluştu:", error);
        showModernToast("Rubrik eklenemedi!", "error");
    }
}

/**
 * Çoklu öğe ekleme
 */
function addMultipleItems() {
    try {
        const count = parseInt(itemCount.value) || 5;
        const type = APP_STATE.multipleItemsType;
        const selectedNode = APP_STATE.multipleItemsNode;
        
        if (!selectedNode) {
            showModernToast("Etkinlik bulunamadı.", "error");
            return;
        }
        
        // Seçilen ÖÇ'leri al
        const outcomeSelection = document.getElementById('outcomeSelection');
        const selectedOutcomes = Array.from(outcomeSelection.selectedOptions).map(option => option.value);
        
        // Mevcut alt öğeleri kontrol et
        if (!selectedNode.children) {
            selectedNode.children = [];
        }
        
        const existingChildrenCount = selectedNode.children.length;
        
        // Varsayılan soru puanı
        const defaultPoints = 3;
        
        // Seçilen tip ve sayıda öğe ekle
        if (type === 'soru') {
            const selectedQuestionType = questionType.value;
            const description = Array.from(document.querySelectorAll('.question-type-item'))
                .find(item => item.getAttribute('data-type') === selectedQuestionType)?.getAttribute('data-description') || '';
            
            // Çoklu soru ekle
            for (let i = 0; i < count; i++) {
                // ÖÇ ataması - dengeli dağıtım için sırayla atama
                let outcome = [];
                if (selectedOutcomes.length > 0) {
                    // i. öğeye i % selectedOutcomes.length indeksindeki ÖÇ'yi ata
                    outcome = [selectedOutcomes[i % selectedOutcomes.length]];
                }
                
                const newNode = {
                    id: `${selectedNode.id}.${(existingChildrenCount + i + 1)}`,
                    name: `${selectedQuestionType} ${existingChildrenCount + i + 1}`,
                    type: selectedQuestionType,
                    weight: 0, // Ağırlık otomatik hesaplanacak
                    points: defaultPoints, // Varsayılan puan 3
                    outcomes: outcome,
                    description: description || 'Değerlendirme sorusu',
                    expanded: false,
                    children: []
                };
                
                selectedNode.children.push(newNode);
            }
            
            // Ağırlıkları otomatik hesapla
            if (selectedNode.children.length > 0) {
                updateSubItemWeight(selectedNode.children[0]);
            }
            
            showModernToast(`${count} adet "${selectedQuestionType}" sorusu eklendi.`);
        } else {
            const selectedRubricType = rubricType.value;
            const description = Array.from(document.querySelectorAll('.rubric-item'))
                .find(item => item.getAttribute('data-type') === selectedRubricType)?.getAttribute('data-description') || '';
            
            // Çoklu rubrik ekle
            for (let i = 0; i < count; i++) {
                // ÖÇ ataması - dengeli dağıtım için sırayla atama
                let outcome = [];
                if (selectedOutcomes.length > 0) {
                    // i. öğeye i % selectedOutcomes.length indeksindeki ÖÇ'yi ata
                    outcome = [selectedOutcomes[i % selectedOutcomes.length]];
                }
                
                const newNode = {
                    id: `${selectedNode.id}.${(existingChildrenCount + i + 1)}`,
                    name: `${selectedRubricType} ${existingChildrenCount + i + 1}`,
                    type: selectedRubricType,
                    weight: 0, // Ağırlık otomatik hesaplanacak
                    points: defaultPoints, // Varsayılan puan 3
                    outcomes: outcome,
                    description: description || 'Değerlendirme kriteri',
                    expanded: false,
                    children: []
                };
                
                selectedNode.children.push(newNode);
            }
            
            // Ağırlıkları otomatik hesapla
            if (selectedNode.children.length > 0) {
                updateSubItemWeight(selectedNode.children[0]);
            }
            
            showModernToast(`${count} adet "${selectedRubricType}" rubriği eklendi.`);
        }
        
        // Modal'ı kapat
        closeModal(multipleItemsModal);
        
        // Ana düğümü genişlet
        selectedNode.expanded = true;
        
        // Ağacı yeniden render et
        renderTree();
        
        // Değerlendirme sekmesini güncelle
        updateAssessmentView();
    } catch (error) {
        console.error("Çoklu öğe eklenirken hata oluştu:", error);
        showModernToast("Öğeler eklenemedi!", "error");
    }
}

/**
 * Soru tipine ait bir tür olup olmadığını kontrol eder
 * @param {string} type - Kontrol edilecek tip
 * @returns {boolean} - Soru tipine ait ise true
 */
function isQuestionType(type) {
    // Direkt 'Soru' ana tipi ise
    if (type === 'Soru') return true;
    
    // Soru içeriyorsa (örn. "Açık Uçlu Soru")
    if (type.includes('Soru')) return true;
    
    // Soru türleri listesinde var mı kontrol et
    const questionTypes = Array.from(document.querySelectorAll('.question-type-item'))
        .map(item => item.getAttribute('data-type'));
    
    return questionTypes.includes(type);
}

/**
 * Rubrik tipine ait bir tür olup olmadığını kontrol eder
 * @param {string} type - Kontrol edilecek tip
 * @returns {boolean} - Rubrik tipine ait ise true
 */
function isRubricType(type) {
    // Direkt 'Rubrik' ana tipi ise
    if (type === 'Rubrik') return true;
    
    // Rubrik türleri listesinde var mı kontrol et
    const rubricTypes = Array.from(document.querySelectorAll('.rubric-item'))
        .map(item => item.getAttribute('data-type'));
    
    return rubricTypes.includes(type);
}

/**
 * Ana Soru tiplerinden biri olup olmadığını kontrol eder
 * @param {string} type - Kontrol edilecek tip
 * @returns {boolean} - Ana soru tiplerinden biri ise true
 */
function isQuestionMainType(type) {
    return type === 'Soru' || type.includes('Soru') || isQuestionType(type);
}

/**
 * Tipe göre dropdown seçeneklerini oluşturur
 * @param {Object} node - Dropdown seçenekleri oluşturulacak düğüm
 * @returns {string} - Dropdown option HTML içeriği
 */
function generateTypeOptions(node) {
    let typeOptions = '';
    
    // Kök düğümler için (Ana etkinlikler)
    if (!node.id.includes('.')) {
        // Yarıyıl içi etkinlikler
        if (node.id.startsWith('A')) {
            typeOptions = ACTIVITY_TYPES.term.map(type => 
                `<option value="${type}" ${node.type === type ? 'selected' : ''}>${type}</option>`
            ).join('');
        } 
        // Yarıyıl sonu etkinlikler
        else if (node.id.startsWith('F')) {
            typeOptions = ACTIVITY_TYPES.final.map(type => 
                `<option value="${type}" ${node.type === type ? 'selected' : ''}>${type}</option>`
            ).join('');
        }
    } 
    // Alt düğümler için (Sorular, rubrikler vb.)
    else {
        // Test tipi için sadece Test seçeneği
        if (node.type === 'Test') {
            typeOptions = `<option value="Test" selected>Test Soruları (Toplu)</option>`;
        }
        // Soru tipi ve türevleri için
        else if (node.type === 'Soru' || node.type.includes('Soru') || isQuestionType(node.type)) {
            // Önce ana 'Soru' seçeneği
            typeOptions = `<option value="Soru" ${node.type === 'Soru' ? 'selected' : ''}>Soru</option>`;
            
            // Sonra diğer soru türleri
            const questionTypes = Array.from(document.querySelectorAll('.question-type-item'))
                .map(item => item.getAttribute('data-type'))
                .filter(type => type !== 'Test'); // Test türünü hariç tut
                
            questionTypes.forEach(type => {
                typeOptions += `<option value="${type}" ${node.type === type ? 'selected' : ''}>${type}</option>`;
            });
        } 
        // Rubrik tipi ve türevleri için
        else {
            // Önce ana 'Rubrik' seçeneği
            typeOptions = `<option value="Rubrik" ${node.type === 'Rubrik' ? 'selected' : ''}>Rubrik</option>`;
            
            // Sonra diğer rubrik türleri
            const rubricTypes = Array.from(document.querySelectorAll('.rubric-item'))
                .map(item => item.getAttribute('data-type'));
                
            rubricTypes.forEach(type => {
                typeOptions += `<option value="${type}" ${node.type === type ? 'selected' : ''}>${type}</option>`;
            });
        }
    }
    
    return typeOptions;
}

/**
 * Tip değişikliğinden sonra node sınıflarını günceller
 * @param {HTMLElement} nodeElement - Düğüm elementi
 * @param {string} oldType - Eski tip
 * @param {string} newType - Yeni tip
 */
function updateNodeClassesAfterTypeChange(nodeElement, oldType, newType) {
    // Eski tip sınıflarını kaldır
    if (isQuestionType(oldType)) {
        nodeElement.classList.remove('question-type');
    } else if (isRubricType(oldType)) {
        nodeElement.classList.remove('rubric-type');
    }
    
    // Yeni tip sınıflarını ekle
    if (isQuestionType(newType)) {
        nodeElement.classList.add('question-type');
    } else if (isRubricType(newType)) {
        nodeElement.classList.add('rubric-type');
    }
    
    // Tip bilgisini veri özniteliğinde güncelle
    nodeElement.dataset.nodetype = newType;
}
/**
 * Ağacı render etme
 */
/**
 * Ağacı render etme
 */
function renderTree() {
    try {
        treeContainer.innerHTML = '';
        
        if (!APP_STATE.assessmentTree || APP_STATE.assessmentTree.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'tree-empty-message';
            emptyMessage.textContent = 'Henüz değerlendirme bileşeni eklenmedi. Ders JSON yükleyin veya yeni bileşenler ekleyin.';
            treeContainer.appendChild(emptyMessage);
            return;
        }

        // Yarıyıl içi bölümü oluştur
        const termSection = document.createElement('div');
        termSection.className = 'tree-section term-section';
        
        // Yarıyıl içi başlık
        const termHeader = document.createElement('div');
        termHeader.className = 'tree-section-header';
        termHeader.innerHTML = '<h3>Yarıyıl İçi Değerlendirme Bileşenleri</h3>';
        termSection.appendChild(termHeader);
        
        // Yarıyıl içi düğümleri
        const termNodes = APP_STATE.assessmentTree.filter(node => node.id.startsWith('A'));
        
        if (termNodes.length === 0) {
            const emptyTerm = document.createElement('div');
            emptyTerm.className = 'tree-section-empty';
            emptyTerm.textContent = 'Henüz yarıyıl içi değerlendirme bileşeni eklenmedi.';
            termSection.appendChild(emptyTerm);
        } else {
            termNodes.forEach(node => {
                renderNode(node, termSection, 0);
            });
        }
        
        // Yarıyıl içi bölümü için ekleme butonu
        const termAddButton = document.createElement('div');
        termAddButton.className = 'add-node-button';
        termAddButton.innerHTML = `
            <button class="btn btn-add-node" data-section="term">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Yarıyıl İçi Etkinlik Ekle
            </button>
        `;
        termSection.appendChild(termAddButton);
        
        // Yarıyıl sonu bölümü oluştur
        const finalSection = document.createElement('div');
        finalSection.className = 'tree-section final-section';
        
        // Yarıyıl sonu başlık
        const finalHeader = document.createElement('div');
        finalHeader.className = 'tree-section-header';
        finalHeader.innerHTML = '<h3>Yarıyıl Sonu Değerlendirme Bileşenleri</h3>';
        finalSection.appendChild(finalHeader);
        
        // Yarıyıl sonu düğümleri
        const finalNodes = APP_STATE.assessmentTree.filter(node => node.id.startsWith('F'));
        
        if (finalNodes.length === 0) {
            const emptyFinal = document.createElement('div');
            emptyFinal.className = 'tree-section-empty';
            emptyFinal.textContent = 'Henüz yarıyıl sonu değerlendirme bileşeni eklenmedi.';
            finalSection.appendChild(emptyFinal);
        } else {
            finalNodes.forEach(node => {
                renderNode(node, finalSection, 0);
            });
        }
        
        // Yarıyıl sonu bölümü için ekleme butonu
        const finalAddButton = document.createElement('div');
        finalAddButton.className = 'add-node-button';
        finalAddButton.innerHTML = `
            <button class="btn btn-add-node" data-section="final">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Yarıyıl Sonu Etkinlik Ekle
            </button>
        `;
        finalSection.appendChild(finalAddButton);
        
        // İlk önce yarıyıl içi, sonra yarıyıl sonu bölümlerini ekle
        treeContainer.appendChild(termSection);
        treeContainer.appendChild(finalSection);
        
        // Ekleme butonları için olay dinleyicileri
        document.querySelectorAll('.btn-add-node').forEach(button => {
            button.addEventListener('click', function() {
                const section = this.getAttribute('data-section');
                if (section === 'term') {
                    addTermActivity();
                } else if (section === 'final') {
                    addFinalActivity();
                }
            });
        });
        
        // Ağırlıkları güncelle
        updateCategoryWeights();
    } catch (error) {
        console.error("Ağaç render edilirken hata oluştu:", error);
        showModernToast("Değerlendirme ağacı yüklenirken hata oluştu!", "error");
    }
}

/**
 * Düğüm silme - ID'ye göre silme yapan versiyon
 * @param {string} nodeId - Silinecek düğüm ID'si
 */
/**
 * Düğüm silme - ID'ye göre silme yapan versiyon
 * @param {string} nodeId - Silinecek düğüm ID'si
 */
function deleteNode(nodeId) {
    if (!nodeId) return;
    
    // Silme onayı iste
    const node = findNodeById(nodeId);
    if (!node) return;
    
    // Modern silme onay modalını göster
    showDeleteConfirmModal(
        // Onay verildiğinde çalışacak fonksiyon
        function() {
            try {
                // Seçili düğüm siliniyorsa seçimi kaldır
                if (APP_STATE.selectedNode && APP_STATE.selectedNode.id === nodeId) {
                    APP_STATE.selectedNode = null;
                }
                
                // Kök düğüm mü kontrol et
                const isRoot = !nodeId.includes('.');
                
                if (isRoot) {
                    // Kök düğümü sil
                    const index = APP_STATE.assessmentTree.findIndex(node => node.id === nodeId);
                    if (index !== -1) {
                        APP_STATE.assessmentTree.splice(index, 1);
                    }
                } else {
                    // Alt düğümü sil
                    const parentId = nodeId.substring(0, nodeId.lastIndexOf('.'));
                    const findParentAndRemoveChild = (nodes, id) => {
                        for (let i = 0; i < nodes.length; i++) {
                            const node = nodes[i];
                            if (node.id === parentId && node.children) {
                                const childIndex = node.children.findIndex(child => child.id === id);
                                if (childIndex !== -1) {
                                    node.children.splice(childIndex, 1);
                                    return true;
                                }
                            }
                            
                            if (node.children && node.children.length > 0) {
                                if (findParentAndRemoveChild(node.children, id)) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    };
                    
                    findParentAndRemoveChild(APP_STATE.assessmentTree, nodeId);
                }
                
                // YENİ KOD: Eğer bir alt düğüm silindiyse, üst düğümün ağırlıklarını kontrol et
                if (!isRoot) {
                    const parentId = nodeId.substring(0, nodeId.lastIndexOf('.'));
                    const parentNode = findNodeById(parentId);
                    if (parentNode) {
                        checkAndOfferRedistribution(parentNode);
                    }
                }
                
                // Ağacı yeniden render et
                renderTree();
                
                // Değerlendirme sekmesini güncelle
                updateAssessmentView();
                
                showModernToast("Etkinlik başarıyla silindi.");
            } catch (error) {
                console.error("Düğüm silinirken hata oluştu:", error);
                showModernToast("Etkinlik silinemedi!", "error");
            }
        },
        // Silme onay mesajı
        `"${node.name}" etkinliğini ve tüm alt öğelerini silmek istediğinizden emin misiniz?`
    );
}

/**
 * Öğrenme çıktılarını listele
 */
function renderOutcomes() {
    try {
        outcomesList.innerHTML = '';
        
        if (!APP_STATE.learningOutcomes || APP_STATE.learningOutcomes.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'outcomes-empty-message';
            emptyMessage.textContent = 'Henüz öğrenme çıktısı tanımlanmadı. Ders JSON yükleyin.';
            outcomesList.appendChild(emptyMessage);
            return;
        }
        
        APP_STATE.learningOutcomes.forEach(outcome => {
            const item = document.createElement('div');
            item.className = 'outcome-item';
            item.textContent = `${outcome.id}: ${outcome.aciklama}`;
            item.title = outcome.aciklama;
            item.dataset.id = outcome.id;
            
            // Çıktıya tıklayarak değerlendirme ağacında seçili düğüme ekleme
            item.addEventListener('click', () => {
                if (APP_STATE.selectedNode) {
                    const outcomesInput = document.querySelector(`.tree-node[data-id="${APP_STATE.selectedNode.id}"] .nodeOutcomes`);
                    if (outcomesInput) {
                        const currentValue = outcomesInput.value.trim();
                        
                        // Alt düğüm ise (soru veya rubrik), sadece bir ÖÇ atanabilsin
                        const isSubItem = APP_STATE.selectedNode.id.includes('.');
                        
                        if (isSubItem) {
                            outcomesInput.value = outcome.id;
                        } else {
                            // Değer boşsa veya virgülle bitiyorsa
                            if (!currentValue) {
                                outcomesInput.value = outcome.id;
                            } else if (currentValue.endsWith(',')) {
                                outcomesInput.value = currentValue + ' ' + outcome.id;
                            } else {
                                outcomesInput.value = currentValue + ', ' + outcome.id;
                            }
                        }
                        
                        // Değeri değişmiş gibi tetikle
                        outcomesInput.dispatchEvent(new Event('change'));
                        
                        showModernToast(`"${outcome.id}" öğrenme çıktısı eklendi.`);
                    }
                } else {
                    showModernToast("Lütfen önce bir etkinlik seçin.", "warning");
                }
            });
            
            outcomesList.appendChild(item);
        });
    } catch (error) {
        console.error("Öğrenme çıktıları render edilirken hata oluştu:", error);
        showModernToast("Öğrenme çıktıları yüklenirken hata oluştu!", "error");
    }
}

/**
 * Ders bilgilerini görüntüleme
 */
function updateCourseInfo() {
    try {
        if (!APP_STATE.courseData) return;
        
        // Ders kodu ve adı
        const dersKodu = APP_STATE.courseData.dersGenel?.dersKodu || '-';
        const dersAdi = APP_STATE.courseData.dersGenel?.dersAdi || '-';
        courseTitle.textContent = `${dersKodu} - ${dersAdi}`;
        
        // Akademik yıl ve dönem
        const akademikYil = APP_STATE.courseData.dersGenel?.akademikYil || '-';
        const donem = APP_STATE.courseData.dersGenel?.dersinVerildigiYariyil || '-';
        const ogretimUyesi = APP_STATE.courseData.dersIcerik?.dersiVerenOgretimUyesiOgretimGorevlisi || '-';
        
        courseDetails.textContent = `Akademik Yıl: ${akademikYil} | Yarıyıl: ${donem} | Öğr. Üyesi: ${ogretimUyesi}`;
        
        // Tarih bilgisi ekle
        courseTerm.textContent = `${akademikYil} (${donem}. Yarıyıl)`;
        
        // Ders bilgileri ekranını vurgulamak için stil ekle
        document.getElementById('courseInfo').style.borderLeft = '5px solid var(--primary-color)';
        document.getElementById('courseInfo').style.backgroundColor = 'var(--secondary-light)';
    } catch (error) {
        console.error("Ders bilgileri güncellenirken hata oluştu:", error);
    }
}

// =====================================================
// NOT GİRİŞİ VE HESAPLAMA FONKSİYONLARI
// =====================================================

/**
 * Değerlendirme görünümünü güncelleme
 */
function updateAssessmentView() {
    try {
        if (!APP_STATE.assessmentTree.length || !APP_STATE.studentData.length) {
            assessmentContainer.innerHTML = `
                <p class="empty-message">Değerlendirme girişi yapabilmek için hem ders tanımlama hem de öğrenci listesi sekmelerinden gerekli bilgileri yüklemeniz gerekmektedir.</p>
            `;
            return;
        }
        
        // Değerlendirme konteynerini temizle
        assessmentContainer.innerHTML = '';
        
        // Yarıyıl içi etkinlikleri
        const termActivities = APP_STATE.assessmentTree.filter(node => node.id.startsWith('A'));
        if (termActivities.length > 0) {
            const termHeader = document.createElement('h3');
            termHeader.textContent = `Yarıyıl İçi Etkinlikler (${APP_STATE.termWeight}%)`;
            termHeader.className = 'section-title';
            assessmentContainer.appendChild(termHeader);
            
            termActivities.forEach(activity => {
                createAssessmentActivitySection(activity, assessmentContainer, 'term');
            });
        }
        
        // Yarıyıl sonu etkinlikleri
        const finalActivities = APP_STATE.assessmentTree.filter(node => node.id.startsWith('F'));
        if (finalActivities.length > 0) {
            const finalHeader = document.createElement('h3');
            finalHeader.textContent = `Yarıyıl Sonu Etkinlikler (${APP_STATE.finalWeight}%)`;
            finalHeader.className = 'section-title';
            assessmentContainer.appendChild(finalHeader);
            
            finalActivities.forEach(activity => {
                createAssessmentActivitySection(activity, assessmentContainer, 'final');
            });
        }
        
        // Notları hesaplama butonu
        const calculateButton = document.createElement('button');
        calculateButton.className = 'btn btn-primary';
        calculateButton.style.marginTop = '20px';
        calculateButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 3a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5zm14 4h-6m-2 4h-2m-4 4h12"></path>
            </svg>
            Notları Hesapla
        `;
        calculateButton.addEventListener('click', calculateGrades);
        assessmentContainer.appendChild(calculateButton);
    } catch (error) {
        console.error("Değerlendirme görünümü güncellenirken hata oluştu:", error);
        showModernToast("Değerlendirme görünümü güncellenemedi!", "error");
    }
}

/**
 * Değerlendirme etkinliği bölümü oluşturma
 * @param {Object} activity - Etkinlik
 * @param {HTMLElement} container - Konteyner elementi
 * @param {string} type - Etkinlik tipi (term/final)
 */
function createAssessmentActivitySection(activity, container, type) {
    try {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'assessment-subsection';
        sectionDiv.dataset.activityId = activity.id;
        
        const header = document.createElement('h4');
        header.innerHTML = `${activity.name} <span class="badge badge-primary">${activity.weight}%</span>`;
        sectionDiv.appendChild(header);
        
        // Aktivitenin alt öğeleri var mı kontrol et
        if (activity.children && activity.children.length > 0) {
            // Alt öğeler var, her biri için giriş alanı oluştur
            activity.children.forEach(subItem => {
                if (subItem.type === 'Test') {
                    // Test soruları için özel giriş
                    createTestInputSection(subItem, sectionDiv);
                } else {
                    // Normal soru veya rubrik
                    createSubItemInputSection(subItem, sectionDiv);
                }
            });
        } else {
            // Alt öğe yoksa basit bir puan girişi göster
            const simpleInputDiv = document.createElement('div');
            simpleInputDiv.className = 'assessment-table-container';
            simpleInputDiv.innerHTML = `
                <table class="assessment-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Öğrenci No</th>
                            <th>Adı</th>
                            <th>Soyadı</th>
                            <th>Puan (${activity.points})</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${APP_STATE.studentData.map((student, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${student.studentId}</td>
                                <td>${student.name}</td>
                                <td>${student.surname}</td>
                                <td>
                                    <input type="number" min="0" max="${activity.points}" 
                                        data-student-id="${student.studentId}" 
                                        data-activity-id="${activity.id}" 
                                        value="${getStudentGrade(student.studentId, activity.id) || ''}"
                                        onchange="updateStudentGrade(this)"
                                    >
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            sectionDiv.appendChild(simpleInputDiv);
        }
        
        container.appendChild(sectionDiv);
    } catch (error) {
        console.error("Değerlendirme etkinliği bölümü oluşturulurken hata oluştu:", error);
    }
}

/**
 * Test soruları için özel giriş bölümü oluşturma
 * @param {Object} testItem - Test öğesi
 * @param {HTMLElement} container - Konteyner elementi
 */
function createTestInputSection(testItem, container) {
    try {
        const testDiv = document.createElement('div');
        testDiv.className = 'assessment-subsection';
        
        // Test detaylarını göster
        const testDetailsDiv = document.createElement('div');
        testDetailsDiv.className = 'test-details';
        testDetailsDiv.innerHTML = `
            <h5>${testItem.name} <span class="badge badge-primary">${testItem.points} puan</span></h5>
            <div class="test-info">
                <p>Toplam ${testItem.testDetails.totalQuestions} soru, her doğru: ${testItem.testDetails.correctWeight} puan, her yanlış: ${testItem.testDetails.wrongPenalty} puan</p>
            </div>
        `;
        testDiv.appendChild(testDetailsDiv);
        
        // Giriş modları oluştur
        const inputModesDiv = document.createElement('div');
        inputModesDiv.className = 'input-modes';
        
        const detailedModeButton = document.createElement('div');
        detailedModeButton.className = 'input-mode active';
        detailedModeButton.textContent = 'Detaylı Giriş';
        detailedModeButton.dataset.mode = 'detailed';
        detailedModeButton.dataset.testId = testItem.id;
        
        const simpleModeButton = document.createElement('div');
        simpleModeButton.className = 'input-mode';
        simpleModeButton.textContent = 'Basit Giriş';
        simpleModeButton.dataset.mode = 'simple';
        simpleModeButton.dataset.testId = testItem.id;
        
        // Mod butonları için olay dinleyicileri
        detailedModeButton.addEventListener('click', function() {
            switchTestInputMode(this.dataset.testId, 'detailed');
        });
        
        simpleModeButton.addEventListener('click', function() {
            switchTestInputMode(this.dataset.testId, 'simple');
        });
        
        inputModesDiv.appendChild(detailedModeButton);
        inputModesDiv.appendChild(simpleModeButton);
        testDiv.appendChild(inputModesDiv);
        
        // Detaylı giriş formu - Doğru/Yanlış sayısı
        const detailedFormDiv = document.createElement('div');
        detailedFormDiv.className = 'test-input-form detailed-mode';
        detailedFormDiv.dataset.testId = testItem.id;
        
        // Tablo oluştur
        const detailedTable = document.createElement('table');
        detailedTable.className = 'assessment-table';
        detailedTable.innerHTML = `
            <thead>
                <tr>
                    <th>No</th>
                    <th>Öğrenci No</th>
                    <th>Adı</th>
                    <th>Soyadı</th>
                    <th>Doğru Sayısı</th>
                    <th>Yanlış Sayısı</th>
                    <th>Boş Sayısı</th>
                    <th>Toplam Puan</th>
                </tr>
            </thead>
            <tbody>
                ${APP_STATE.studentData.map((student, index) => {
                    // Test sonuçlarını al
                    const testScore = getStudentTestScore(student.studentId, testItem.id);
                    const correct = testScore?.correct || 0;
                    const wrong = testScore?.wrong || 0;
                    const empty = testItem.testDetails.totalQuestions - correct - wrong;
                    const totalScore = correct * testItem.testDetails.correctWeight - wrong * Math.abs(testItem.testDetails.wrongPenalty);
                    
                    return `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${student.studentId}</td>
                            <td>${student.name}</td>
                            <td>${student.surname}</td>
                            <td>
                                <input type="number" min="0" max="${testItem.testDetails.totalQuestions}" 
                                    data-student-id="${student.studentId}" 
                                    data-test-id="${testItem.id}" 
                                    data-field="correct"
                                    value="${correct}"
                                    onchange="updateTestScore(this)"
                                >
                            </td>
                            <td>
                                <input type="number" min="0" max="${testItem.testDetails.totalQuestions}" 
                                    data-student-id="${student.studentId}" 
                                    data-test-id="${testItem.id}" 
                                    data-field="wrong"
                                    value="${wrong}"
                                    onchange="updateTestScore(this)"
                                >
                            </td>
                            <td>${empty}</td>
                            <td class="total-score">${totalScore.toFixed(1)}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
        detailedFormDiv.appendChild(detailedTable);
        testDiv.appendChild(detailedFormDiv);
        
        // Basit giriş formu - Sadece toplam puan
        const simpleFormDiv = document.createElement('div');
        simpleFormDiv.className = 'test-input-form simple-mode';
        simpleFormDiv.dataset.testId = testItem.id;
        simpleFormDiv.style.display = 'none'; // Başlangıçta gizli
        
        // Tablo oluştur
        const simpleTable = document.createElement('table');
        simpleTable.className = 'assessment-table';
        simpleTable.innerHTML = `
            <thead>
                <tr>
                    <th>No</th>
                    <th>Öğrenci No</th>
                    <th>Adı</th>
                    <th>Soyadı</th>
                    <th>Toplam Puan (${testItem.points})</th>
                </tr>
            </thead>
            <tbody>
                ${APP_STATE.studentData.map((student, index) => {
                    // Test sonuçlarını al
                    const testScore = getStudentTestScore(student.studentId, testItem.id);
                    const correct = testScore?.correct || 0;
                    const wrong = testScore?.wrong || 0;
                    const totalScore = correct * testItem.testDetails.correctWeight - wrong * Math.abs(testItem.testDetails.wrongPenalty);
                    
                    return `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${student.studentId}</td>
                            <td>${student.name}</td>
                            <td>${student.surname}</td>
                            <td>
                                <input type="number" min="0" max="${testItem.points}" 
                                    data-student-id="${student.studentId}" 
                                    data-activity-id="${testItem.id}" 
                                    value="${totalScore.toFixed(1)}"
                                    onchange="updateStudentGrade(this)"
                                >
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
        simpleFormDiv.appendChild(simpleTable);
        testDiv.appendChild(simpleFormDiv);
        
        container.appendChild(testDiv);
    } catch (error) {
        console.error("Test giriş bölümü oluşturulurken hata oluştu:", error);
    }
}

/**
 * Alt öğe giriş bölümü oluşturma (Soru/Rubrik)
 * @param {Object} subItem - Alt öğe
 * @param {HTMLElement} container - Konteyner elementi
 */
function createSubItemInputSection(subItem, container) {
    try {
        const subDiv = document.createElement('div');
        subDiv.className = 'assessment-subsection';
        
        const header = document.createElement('h5');
        header.innerHTML = `${subItem.name} <span class="badge badge-primary">${subItem.points} puan</span> <span class="badge badge-success">${subItem.outcomes.join(', ')}</span>`;
        subDiv.appendChild(header);
        
        // Tablo oluştur
        const table = document.createElement('table');
        table.className = 'assessment-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>No</th>
                    <th>Öğrenci No</th>
                    <th>Adı</th>
                    <th>Soyadı</th>
                    <th>Puan (${subItem.points})</th>
                </tr>
            </thead>
            <tbody>
                ${APP_STATE.studentData.map((student, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${student.studentId}</td>
                        <td>${student.name}</td>
                        <td>${student.surname}</td>
                        <td>
                            <input type="number" min="0" max="${subItem.points}" 
                                data-student-id="${student.studentId}" 
                                data-activity-id="${subItem.id}" 
                                value="${getStudentGrade(student.studentId, subItem.id) || ''}"
                                onchange="updateStudentGrade(this)"
                            >
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        subDiv.appendChild(table);
        
        container.appendChild(subDiv);
    } catch (error) {
        console.error("Alt öğe giriş bölümü oluşturulurken hata oluştu:", error);
    }
}

/**
 * Test giriş modunu değiştirme
 * @param {string} testId - Test ID'si
 * @param {string} mode - Mod (detailed/simple)
 */
function switchTestInputMode(testId, mode) {
    try {
        // Mod butonlarını güncelle
        document.querySelectorAll(`.input-mode[data-test-id="${testId}"]`).forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Giriş formlarını göster/gizle
        const detailedForm = document.querySelector(`.test-input-form.detailed-mode[data-test-id="${testId}"]`);
        const simpleForm = document.querySelector(`.test-input-form.simple-mode[data-test-id="${testId}"]`);
        
        if (mode === 'detailed') {
            detailedForm.style.display = 'block';
            simpleForm.style.display = 'none';
        } else {
            detailedForm.style.display = 'none';
            simpleForm.style.display = 'block';
        }
    } catch (error) {
        console.error("Test giriş modu değiştirilirken hata oluştu:", error);
    }
}

/**
 * Öğrenci notunu getirme - Tüm formatları destekler
 * @param {string} studentId - Öğrenci ID'si
 * @param {string} activityId - Etkinlik ID'si
 * @returns {number|null} - Not değeri
 */
function getStudentGrade(studentId, activityId) {
    if (!APP_STATE.gradesData || !APP_STATE.gradesData[studentId]) return null;
    
    const studentGrades = APP_STATE.gradesData[studentId];
    const activity = findNodeById(activityId);
    
    // DURUM 1: Doğrudan erişim (format: studentId.activityId = value)
    if (studentGrades[activityId] !== undefined) {
        const grade = studentGrades[activityId];
        
        // Sayısal değer
        if (typeof grade === 'number') {
            return grade;
        }
        
        // Test notu (object formatında)
        if (typeof grade === 'object' && grade !== null) {
            // Test tipi
            if (grade.tip === 'test' && activity && activity.type === 'Test') {
                const correct = grade.dogru || 0;
                const wrong = grade.yanlis || 0;
                return correct * (activity.testDetails?.correctWeight || 5) - 
                       wrong * Math.abs(activity.testDetails?.wrongPenalty || 0);
            }
        }
    }
    
    // DURUM 2: İç içe yapı kontrolü (format: studentId.parentId.activityId = value)
    const parts = activityId.split('.');
    if (parts.length > 1) {
        const parentId = parts[0]; // A1.1 -> A1
        const shortId = parts[parts.length - 1]; // A1.1 -> 1
        
        if (studentGrades[parentId] && typeof studentGrades[parentId] === 'object') {
            // Tam ID ile erişim
            if (studentGrades[parentId][activityId] !== undefined) {
                // Test notu
                if (typeof studentGrades[parentId][activityId] === 'object' && 
                    studentGrades[parentId][activityId] !== null && 
                    studentGrades[parentId][activityId].tip === 'test') {
                    
                    const testScore = studentGrades[parentId][activityId];
                    const correct = testScore.dogru || 0;
                    const wrong = testScore.yanlis || 0;
                    
                    if (activity && activity.type === 'Test') {
                        return correct * (activity.testDetails?.correctWeight || 5) - 
                               wrong * Math.abs(activity.testDetails?.wrongPenalty || 0);
                    }
                }
                // Normal not
                else if (typeof studentGrades[parentId][activityId] === 'number') {
                    return studentGrades[parentId][activityId];
                }
            }
            
            // Kısa ID ile erişim (A1.1 -> sadece 1)
            if (studentGrades[parentId][shortId] !== undefined) {
                // Test notu
                if (typeof studentGrades[parentId][shortId] === 'object' && 
                    studentGrades[parentId][shortId] !== null && 
                    studentGrades[parentId][shortId].tip === 'test') {
                    
                    const testScore = studentGrades[parentId][shortId];
                    const correct = testScore.dogru || 0;
                    const wrong = testScore.yanlis || 0;
                    
                    if (activity && activity.type === 'Test') {
                        return correct * (activity.testDetails?.correctWeight || 5) - 
                               wrong * Math.abs(activity.testDetails?.wrongPenalty || 0);
                    }
                }
                // Normal not
                else if (typeof studentGrades[parentId][shortId] === 'number') {
                    return studentGrades[parentId][shortId];
                }
            }
        }
    }
    
    return null;
}

/**
 * Öğrenci test notunu getirme
 * @param {string} studentId - Öğrenci ID'si
 * @param {string} testId - Test ID'si
 * @returns {Object|null} - Test notları
 */
function getStudentTestScore(studentId, testId) {
    if (!APP_STATE.gradesData[studentId] || !APP_STATE.gradesData[studentId][testId]) return null;
    
    const testGrade = APP_STATE.gradesData[studentId][testId];
    if (testGrade.type === 'test' || testGrade.tip === 'test') {
        return {
            type: 'test',
            correct: testGrade.correct || testGrade.dogru || 0,
            wrong: testGrade.wrong || testGrade.yanlis || 0
        };
    }
    
    // Test değilse null dön
    return null;
}

/**
 * Öğrenci notunu güncelleme - İç içe veya düz yapı destekli
 * @param {HTMLInputElement} input - Not input elementi
 */
function updateStudentGrade(input) {
    try {
        const studentId = input.dataset.studentId;
        const activityId = input.dataset.activityId;
        
        // Aktiviteyi bul ve maksimum puanını kontrol et
        const activity = findNodeById(activityId);
        if (!activity) {
            console.error(`Aktivite bulunamadı: ${activityId}`);
            return;
        }
        
        // Maksimum puan kontrolü
        const maxPoints = activity.points || 100;
        let value = parseFloat(input.value) || 0;
        
        // Maksimum puanı aşan değerleri sınırla
        if (value > maxPoints) {
            value = maxPoints;
            input.value = maxPoints;
            showModernToast(`Dikkat: Puan ${maxPoints} değerinden büyük olamaz!`, "warning");
        }
        
        // Öğrenci verisi oluştur
        if (!APP_STATE.gradesData[studentId]) {
            APP_STATE.gradesData[studentId] = {};
        }
        
        // Test mi kontrol et
        if (activity && activity.type === 'Test') {
            // Test skorları için özel işlem
            const correctWeight = activity.testDetails?.correctWeight || 5;
            const wrongPenalty = Math.abs(activity.testDetails?.wrongPenalty || 0);
            
            // Basit yaklaşım: tüm puanı doğru sorudan gelecek şekilde ayarla
            const correctEstimate = Math.round(value / correctWeight);
            
            APP_STATE.gradesData[studentId][activityId] = {
                tip: 'test',
                dogru: correctEstimate,
                yanlis: 0
            };
            
            // Detaylı formdaki değerleri güncelle (varsa)
            const correctInput = document.querySelector(`input[data-student-id="${studentId}"][data-test-id="${activityId}"][data-field="correct"]`);
            const wrongInput = document.querySelector(`input[data-student-id="${studentId}"][data-test-id="${activityId}"][data-field="wrong"]`);
            
            if (correctInput) correctInput.value = correctEstimate;
            if (wrongInput) wrongInput.value = 0;
            
            // Öğrenci bazlı görünümdeki inputları da güncelle
            const studentViewCorrectInput = document.querySelector(`#studentGradesContainer input[data-student-id="${studentId}"][data-test-id="${activityId}"][data-field="correct"]`);
            const studentViewWrongInput = document.querySelector(`#studentGradesContainer input[data-student-id="${studentId}"][data-test-id="${activityId}"][data-field="wrong"]`);
            const studentViewTotalElement = document.querySelector(`#studentGradesContainer .student-test-item[data-subitem-id="${activityId}"] .total-test-score`);
            
            if (studentViewCorrectInput) studentViewCorrectInput.value = correctEstimate;
            if (studentViewWrongInput) studentViewWrongInput.value = 0;
            if (studentViewTotalElement) studentViewTotalElement.textContent = value.toFixed(1);
            
        } else {
            // Normal not için
            APP_STATE.gradesData[studentId][activityId] = value;
            
            // Alt düğüm yapısını oluştur (A1.1 -> A1 altında storlama)
            const parts = activityId.split('.');
            if (parts.length > 1) {
                const parentId = parts[0]; // A1
                const shortId = parts[parts.length - 1]; // 1
                
                // Eğer üst aktivite yoksa oluştur
                if (!APP_STATE.gradesData[studentId][parentId]) {
                    APP_STATE.gradesData[studentId][parentId] = {
                        toplam: 0
                    };
                }
                
                // Not değerini ekle - hem tam ID, hem kısa ID olarak
                APP_STATE.gradesData[studentId][parentId][activityId] = value;
                APP_STATE.gradesData[studentId][parentId][shortId] = value;
                
                // Toplama hesapla
                updateParentActivityTotal(studentId, parentId);
            }
            
            // Öğrenci bazlı görünümdeki inputu güncelle
            const studentViewInput = document.querySelector(`#studentGradesContainer input[data-student-id="${studentId}"][data-activity-id="${activityId}"]`);
            if (studentViewInput && studentViewInput !== input) {
                studentViewInput.value = value;
            }
        }
        
        // Notları hesapla
        updateStudentCalculatedGrade(studentId);
        
        // Öğrenci özet bilgilerini güncelle
        updateStudentSummary(studentId);
        
    } catch (error) {
        console.error("Öğrenci notu güncellenirken hata oluştu:", error);
        showModernToast("Not güncellenirken hata oluştu!", "error");
    }
}

/**
 * Tüm öğrencilerin final notlarını hesapla ve kaydet
 */
function calculateFinalGrades() {
    try {
        if (!APP_STATE.studentData || APP_STATE.studentData.length === 0) {
            return;
        }
        
        // Her öğrenci için notları hesapla
        APP_STATE.studentData.forEach(student => {
            const studentId = student.studentId;
            
            if (!APP_STATE.gradesData[studentId]) {
                APP_STATE.gradesData[studentId] = {};
            }
            
            // Yarıyıl içi etkinlikler
            const termActivities = APP_STATE.assessmentTree.filter(node => node.id.startsWith('A'));
            let termGrade = 0;
            
            // İç ağırlık toplamı
            const termInternalTotal = termActivities.reduce((sum, node) => sum + parseFloat(node.weight || 0), 0);
            
            if (termInternalTotal > 0) {
                termActivities.forEach(activity => {
                    // İç ağırlık normalleştirmesi
                    const activityWeight = activity.weight / termInternalTotal; 
                    let activityGrade = 0;
                    
                    if (activity.children && activity.children.length > 0) {
                        // Alt etkinlikler
                        const childrenTotalWeight = activity.children.reduce((sum, child) => sum + parseFloat(child.weight || 0), 0);
                        
                        if (childrenTotalWeight > 0) {
                            activity.children.forEach(subItem => {
                                // Alt öğe ağırlık normalleştirmesi
                                const subItemWeight = subItem.weight / childrenTotalWeight; 
                                const grade = getStudentGrade(studentId, subItem.id) || 0;
                                const scaledGrade = (grade / (subItem.points || 1)) * 100; // 100 üzerinden
                                activityGrade += scaledGrade * subItemWeight;
                            });
                        }
                    } else {
                        // Basit etkinlik
                        const grade = getStudentGrade(studentId, activity.id) || 0;
                        activityGrade = (grade / (activity.points || 1)) * 100; // 100 üzerinden
                    }
                    
                    termGrade += activityGrade * activityWeight;
                });
            }
            
            // Yarıyıl sonu etkinlikler
            const finalActivities = APP_STATE.assessmentTree.filter(node => node.id.startsWith('F'));
            let finalGrade = 0;
            
            // İç ağırlık toplamı
            const finalInternalTotal = finalActivities.reduce((sum, node) => sum + parseFloat(node.weight || 0), 0);
            
            if (finalInternalTotal > 0) {
                finalActivities.forEach(activity => {
                    // İç ağırlık normalleştirmesi
                    const activityWeight = activity.weight / finalInternalTotal;
                    let activityGrade = 0;
                    
                    if (activity.children && activity.children.length > 0) {
                        // Alt etkinlikler
                        const childrenTotalWeight = activity.children.reduce((sum, child) => sum + parseFloat(child.weight || 0), 0);
                        
                        if (childrenTotalWeight > 0) {
                            activity.children.forEach(subItem => {
                                // Alt öğe ağırlık normalleştirmesi
                                const subItemWeight = subItem.weight / childrenTotalWeight;
                                const grade = getStudentGrade(studentId, subItem.id) || 0;
                                const scaledGrade = (grade / (subItem.points || 1)) * 100; // 100 üzerinden
                                activityGrade += scaledGrade * subItemWeight;
                            });
                        }
                    } else {
                        // Basit etkinlik
                        const grade = getStudentGrade(studentId, activity.id) || 0;
                        activityGrade = (grade / (activity.points || 1)) * 100; // 100 üzerinden
                    }
                    
                    finalGrade += activityGrade * activityWeight;
                });
            }
            
            // Toplam ve harf notu
            const totalGrade = (termGrade * APP_STATE.termWeight / 100) + (finalGrade * APP_STATE.finalWeight / 100);
            const letterGrade = getLetterGrade(totalGrade);
            
            // Notları kaydet
            APP_STATE.gradesData[studentId].yariyilIciNotu = parseFloat(termGrade.toFixed(2));
            APP_STATE.gradesData[studentId].yariyilSonuNotu = parseFloat(finalGrade.toFixed(2));
            APP_STATE.gradesData[studentId].basariNotu = parseFloat(totalGrade.toFixed(2));
            APP_STATE.gradesData[studentId].harfNotu = letterGrade;
        });
        
    } catch (error) {
        console.error("Final notları hesaplanırken hata oluştu:", error);
    }
}

/**
 * Tek bir öğrencinin hesaplanmış notlarını güncelleme
 * @param {string} studentId - Öğrenci ID'si
 */
function updateStudentCalculatedGrade(studentId) {
    try {
        if (!APP_STATE.gradesData[studentId]) {
            return;
        }
        
        // Yarıyıl içi etkinlikler
        const termActivities = APP_STATE.assessmentTree.filter(node => node.id.startsWith('A'));
        let termGrade = 0;
        
        // İç ağırlık toplamı
        const termInternalTotal = termActivities.reduce((sum, node) => sum + parseFloat(node.weight || 0), 0);
        
        if (termInternalTotal > 0) {
            termActivities.forEach(activity => {
                // İç ağırlık normalleştirmesi
                const activityWeight = activity.weight / termInternalTotal; 
                let activityGrade = 0;
                
                if (activity.children && activity.children.length > 0) {
                    // Alt etkinlikler
                    const childrenTotalWeight = activity.children.reduce((sum, child) => sum + parseFloat(child.weight || 0), 0);
                    
                    if (childrenTotalWeight > 0) {
                        activity.children.forEach(subItem => {
                            // Alt öğe ağırlık normalleştirmesi
                            const subItemWeight = subItem.weight / childrenTotalWeight; 
                            const grade = getStudentGrade(studentId, subItem.id) || 0;
                            const scaledGrade = (grade / (subItem.points || 1)) * 100; // 100 üzerinden
                            activityGrade += scaledGrade * subItemWeight;
                        });
                    }
                } else {
                    // Basit etkinlik
                    const grade = getStudentGrade(studentId, activity.id) || 0;
                    activityGrade = (grade / (activity.points || 1)) * 100; // 100 üzerinden
                }
                
                termGrade += activityGrade * activityWeight;
            });
        }
        
        // Yarıyıl sonu etkinlikler
        const finalActivities = APP_STATE.assessmentTree.filter(node => node.id.startsWith('F'));
        let finalGrade = 0;
        
        // İç ağırlık toplamı
        const finalInternalTotal = finalActivities.reduce((sum, node) => sum + parseFloat(node.weight || 0), 0);
        
        if (finalInternalTotal > 0) {
            finalActivities.forEach(activity => {
                // İç ağırlık normalleştirmesi
                const activityWeight = activity.weight / finalInternalTotal;
                let activityGrade = 0;
                
                if (activity.children && activity.children.length > 0) {
                    // Alt etkinlikler
                    const childrenTotalWeight = activity.children.reduce((sum, child) => sum + parseFloat(child.weight || 0), 0);
                    
                    if (childrenTotalWeight > 0) {
                        activity.children.forEach(subItem => {
                            // Alt öğe ağırlık normalleştirmesi
                            const subItemWeight = subItem.weight / childrenTotalWeight;
                            const grade = getStudentGrade(studentId, subItem.id) || 0;
                            const scaledGrade = (grade / (subItem.points || 1)) * 100; // 100 üzerinden
                            activityGrade += scaledGrade * subItemWeight;
                        });
                    }
                } else {
                    // Basit etkinlik
                    const grade = getStudentGrade(studentId, activity.id) || 0;
                    activityGrade = (grade / (activity.points || 1)) * 100; // 100 üzerinden
                }
                
                finalGrade += activityGrade * activityWeight;
            });
        }
        
        // Toplam ve harf notu
        const totalGrade = (termGrade * APP_STATE.termWeight / 100) + (finalGrade * APP_STATE.finalWeight / 100);
        const letterGrade = getLetterGrade(totalGrade);
        
        // Hesaplanmış not bilgilerini ekle
        APP_STATE.gradesData[studentId].yariyilIciNotu = parseFloat(termGrade.toFixed(2));
        APP_STATE.gradesData[studentId].yariyilSonuNotu = parseFloat(finalGrade.toFixed(2));
        APP_STATE.gradesData[studentId].basariNotu = parseFloat(totalGrade.toFixed(2));
        APP_STATE.gradesData[studentId].harfNotu = letterGrade;
        
    } catch (error) {
        console.error("Öğrenci notu hesaplanırken hata oluştu:", error);
    }
}

/**
 * Test skorunu güncelleme
 * @param {HTMLInputElement} input - Test skoru input elementi
 */
function updateTestScore(input) {
    try {
        const studentId = input.dataset.studentId;
        const testId = input.dataset.testId;
        const field = input.dataset.field;
        const value = parseInt(input.value) || 0;
        
        // Test verisini güncelle
        updateTestScoreData(studentId, testId, field, value);
        
        // İlgili görünüm alanlarını güncelle
        updateTestScoreViews(studentId, testId, field, value, input);
        
        // Test sorularına rastgele doğru/yanlış dağılımı yap
        const testScore = APP_STATE.gradesData[studentId][testId];
        if (testScore && (field === 'correct' || field === 'wrong')) {
            // Doğru/yanlış değeri değiştiğinde modern test skoru dağıtım modalını göster
            showTestScoreDistributionModal(studentId, testId);
        }
    } catch (error) {
        console.error("Test skoru güncellenirken hata oluştu:", error);
        showModernToast("Test skoru güncellenirken hata oluştu!", "error");
    }
}

// Test score görünümlerini güncelleme (yardımcı fonksiyon)
function updateTestScoreViews(studentId, testId, field, value, sourceInput) {
    const testNode = findNodeById(testId);
    if (!testNode) return;
    
    const testScore = APP_STATE.gradesData[studentId][testId];
    const correct = testScore.dogru || 0;
    const wrong = testScore.yanlis || 0;
    const correctWeight = testNode.testDetails.correctWeight;
    const wrongPenalty = Math.abs(testNode.testDetails.wrongPenalty);
    const totalScore = correct * correctWeight - wrong * wrongPenalty;
    
    // Değerlendirme sekmesindeki toplam puan hücresini güncelle
    const assessmentRow = document.querySelector(`tr:has(input[data-student-id="${studentId}"][data-test-id="${testId}"])`);
    const assessmentTotalScore = assessmentRow?.querySelector('.total-score');
    if (assessmentTotalScore) {
        assessmentTotalScore.textContent = totalScore.toFixed(1);
    }
    
    // Basit giriş formundaki değeri de güncelle
    const simpleInput = document.querySelector(`input[data-student-id="${studentId}"][data-activity-id="${testId}"]`);
    if (simpleInput) {
        simpleInput.value = totalScore.toFixed(1);
    }
    
    // Öğrenci görünümündeki ilgili alanları güncelle
    if (field === 'correct' || field === 'wrong') {
        // Karşılık gelen inputu bul ve güncelle (kendisi değilse)
        const studentViewInput = document.querySelector(`#studentGradesContainer input[data-student-id="${studentId}"][data-test-id="${testId}"][data-field="${field}"]`);
        if (studentViewInput && studentViewInput !== sourceInput) {
            studentViewInput.value = value;
        }
    }
    
    // Öğrenci görünümündeki toplam skoru güncelle
    updateStudentViewTestTotal(studentId, testId);
    
    // Notları yeniden hesapla
    updateStudentCalculatedGrade(studentId);
    
    // Öğrenci özet bilgilerini güncelle
    updateStudentSummary(studentId);
}

/**
 * Notları hesaplama ve görüntüleme
 */
function calculateGrades() {
    try {
        if (!APP_STATE.gradesData || Object.keys(APP_STATE.gradesData).length === 0) {
            showModernToast("Henüz not girişi yapılmamış!", "warning");
            return;
        }
        
        // Tüm notları hesapla
        calculateFinalGrades();
        
        // Notlar tablosunu göster
        const finalGrades = {};
        
        APP_STATE.studentData.forEach(student => {
            const studentId = student.studentId;
            if (!APP_STATE.gradesData[studentId]) {
                finalGrades[studentId] = {
                    studentId,
                    name: student.name,
                    surname: student.surname,
                    termGrade: 0,
                    finalGrade: 0,
                    totalGrade: 0,
                    letterGrade: 'FF'
                };
                return;
            }
            
            finalGrades[studentId] = {
                studentId,
                name: student.name,
                surname: student.surname,
                termGrade: APP_STATE.gradesData[studentId].yariyilIciNotu || 0,
                finalGrade: APP_STATE.gradesData[studentId].yariyilSonuNotu || 0,
                totalGrade: APP_STATE.gradesData[studentId].basariNotu || 0,
                letterGrade: APP_STATE.gradesData[studentId].harfNotu || 'FF'
            };
        });

        // Notlar sekmesine geç
        switchTab('grades');
        
        // Notlar tablosunu güncelle
        updateGradesTable(finalGrades);
        
        // İstatistikleri güncelle
        updateGradeStatistics(finalGrades);
        
        showModernToast("Notlar başarıyla hesaplandı.");
    } catch (error) {
        console.error("Notlar hesaplanırken hata oluştu:", error);
        showModernToast("Notlar hesaplanırken hata oluştu!", "error");
    }
}

/**
 * Notlar tablosunu güncelleme
 * @param {Object} finalGrades - Hesaplanan son notlar
 */
function updateGradesTable(finalGrades) {
    try {
        const tableBody = document.createElement('tbody');
        
        APP_STATE.studentData.forEach((student, index) => {
            const studentGrade = finalGrades[student.studentId] || {
                termGrade: 0,
                finalGrade: 0,
                totalGrade: 0,
                letterGrade: 'FF'
            };
            
            const row = document.createElement('tr');
            
            // Geçme/kalma durumuna göre satır stilini belirle
            const letterGrade = studentGrade.letterGrade;
            if (['AA', 'BA', 'BB', 'CB', 'CC'].includes(letterGrade)) {
                row.style.backgroundColor = 'rgba(40, 167, 69, 0.1)'; // Başarılı
            } else if (['DC', 'DD'].includes(letterGrade)) {
                row.style.backgroundColor = 'rgba(255, 193, 7, 0.1)'; // Koşullu başarılı
            } else {
                row.style.backgroundColor = 'rgba(220, 53, 69, 0.1)'; // Başarısız
            }
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${student.studentId}</td>
                <td>${student.name}</td>
                <td>${student.surname}</td>
                <td>${studentGrade.termGrade}</td>
                <td>${studentGrade.finalGrade}</td>
                <td>${studentGrade.totalGrade}</td>
                <td>${studentGrade.letterGrade}</td>
            `;
            tableBody.appendChild(row);
        });
        
        // Tabloyu güncelle - genel ağırlıkları da göster
        gradesTable.innerHTML = `
            <thead>
                <tr>
                    <th>No</th>
                    <th>Öğrenci No</th>
                    <th>Adı</th>
                    <th>Soyadı</th>
                    <th>Yarıyıl İçi (${APP_STATE.termWeight}%)</th>
                    <th>Yarıyıl Sonu (${APP_STATE.finalWeight}%)</th>
                    <th>Toplam Puan</th>
                    <th>Harf Notu</th>
                </tr>
            </thead>
        `;
        gradesTable.appendChild(tableBody);
    } catch (error) {
        console.error("Notlar tablosu güncellenirken hata oluştu:", error);
    }
}

/**
 * Not istatistiklerini güncelleme
 * @param {Object} finalGrades - Hesaplanan son notlar
 */
function updateGradeStatistics(finalGrades) {
    try {
        const grades = Object.values(finalGrades);
        
        // Ortalama hesapla
        const totalSum = grades.reduce((sum, grade) => sum + parseFloat(grade.totalGrade), 0);
        const average = totalSum / grades.length;
        
        // Harf notları dağılımı
        const letterGradeCounts = {};
        grades.forEach(grade => {
            const letter = grade.letterGrade;
            letterGradeCounts[letter] = (letterGradeCounts[letter] || 0) + 1;
        });
        
        // Geçme/kalma oranı
        const passingLetters = ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD'];
        const passingCount = grades.filter(grade => passingLetters.includes(grade.letterGrade)).length;
        const failingCount = grades.length - passingCount;
        const passRate = (passingCount / grades.length) * 100;
        
        // İstatistikleri göster
        statsContent.innerHTML = `
            <div class="stats-grid">
                <div class="stats-card">
                    <h5>Genel İstatistikler</h5>
                    <p>Sınıf Mevcudu: <strong>${grades.length}</strong> öğrenci</p>
                    <p>Sınıf Ortalaması: <strong>${average.toFixed(2)}</strong></p>
                    <p>Geçen Öğrenci Sayısı: <strong>${passingCount}</strong> (${passRate.toFixed(1)}%)</p>
                    <p>Kalan Öğrenci Sayısı: <strong>${failingCount}</strong> (${(100 - passRate).toFixed(1)}%)</p>
                </div>
                
                <div class="stats-card">
                    <h5>Harf Notu Dağılımı</h5>
                    <ul class="grade-distribution">
                        ${Object.entries(letterGradeCounts).sort().map(([letter, count]) => {
                            // Harf notuna göre renk belirle
                            let colorClass = '';
                            if (['AA', 'BA', 'BB'].includes(letter)) {
                                colorClass = 'grade-high';
                            } else if (['CB', 'CC'].includes(letter)) {
                                colorClass = 'grade-mid';
                            } else if (['DC', 'DD'].includes(letter)) {
                                colorClass = 'grade-low';
                            } else {
                                colorClass = 'grade-fail';
                            }
                            
                            return `
                                <li class="${colorClass}">
                                    <span class="grade-letter">${letter}</span>
                                    <span class="grade-count">${count} öğrenci</span>
                                    <span class="grade-percent">(${((count / grades.length) * 100).toFixed(1)}%)</span>
                                    <div class="grade-bar" style="width: ${(count / grades.length) * 100}%"></div>
                                </li>
                            `;
                        }).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        // Grafik oluştur (eğer Chart.js kütüphanesi yüklenmişse)
        if (window.Chart) {
            chartContainer.innerHTML = '<canvas id="gradeChart"></canvas>';
            const ctx = document.getElementById('gradeChart').getContext('2d');
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(letterGradeCounts).sort(),
                    datasets: [{
                        data: Object.values(letterGradeCounts).sort((a, b) => b - a),
                        backgroundColor: [
                            'rgba(40, 167, 69, 0.8)', // AA
                            'rgba(40, 167, 69, 0.6)', // BA
                            'rgba(40, 167, 69, 0.4)', // BB
                            'rgba(23, 162, 184, 0.8)', // CB
                            'rgba(23, 162, 184, 0.6)', // CC
                            'rgba(255, 193, 7, 0.8)', // DC
                            'rgba(255, 193, 7, 0.6)', // DD
                            'rgba(220, 53, 69, 0.8)', // FD
                            'rgba(220, 53, 69, 0.6)'  // FF
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Harf Notu Dağılımı'
                    }
                }
            });
        }
    } catch (error) {
        console.error("Not istatistikleri güncellenirken hata oluştu:", error);
    }
}

// =====================================================
// ÖĞRENCİ VERİLERİ FONKSIYONLARI
// =====================================================

/**
 * Öğrenci tablosunu güncelleme
 */
function updateStudentTable() {
    try {
        const tableHeader = document.createElement('tr');
        tableHeader.innerHTML = `
            <th>No</th>
            <th>Öğrenci No</th>
            <th>Adı</th>
            <th>Soyadı</th>
            <th>Durum</th>
        `;
        
        const tableBody = document.createElement('tbody');
        tableBody.appendChild(tableHeader);
        
        if (!APP_STATE.studentData || APP_STATE.studentData.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="5" class="empty-message">Öğrenci listesi yüklenmedi</td>`;
            tableBody.appendChild(emptyRow);
        } else {
            APP_STATE.studentData.forEach((student, index) => {
                const row = document.createElement('tr');
                
                // Duruma göre satır stili
                if (student.status === 'İlişiği Kesilmiş') {
                    row.style.color = 'var(--text-light)';
                    row.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                }
                
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${student.studentId}</td>
                    <td>${student.name}</td>
                    <td>${student.surname}</td>
                    <td>${student.status || 'Aktif'}</td>
                `;
                tableBody.appendChild(row);
            });
        }
        
        studentTable.innerHTML = '';
        studentTable.appendChild(tableBody);
        
        // Değerlendirme görünümünü güncelle
        updateAssessmentView();
    } catch (error) {
        console.error("Öğrenci tablosu güncellenirken hata oluştu:", error);
        showModernToast("Öğrenci tablosu güncellenemedi!", "error");
    }
}

/**
 * Öğrenci listesini temizleme
 */
function clearStudents() {
    showDeleteConfirmModal(
        function() {
            try {
                APP_STATE.studentData = [];
                APP_STATE.gradesData = {};
                updateStudentTable();
                
                // Değerlendirme görünümünü güncelle
                updateAssessmentView();
                
                showModernToast("Öğrenci listesi temizlendi.");
            } catch (error) {
                console.error("Öğrenci listesi temizlenirken hata oluştu:", error);
                showModernToast("Öğrenci listesi temizlenemedi!", "error");
            }
        },
        'Öğrenci listesini temizlemek istediğinizden emin misiniz?'
    );
}

/**
 * Öğrenci verilerini içe aktarma - Tüm formatları destekler
 * @param {Object} jsonData - JSON veri
 */
function importStudentData(jsonData) {
    try {
        let studentData = [];
        let gradesData = {};
        
        // Öğrenci listesini farklı formatlarda kontrol et
        if (jsonData.ogrenciler && Array.isArray(jsonData.ogrenciler)) {
            // Format 1: Ders değerlendirme sistemi formatı
            studentData = jsonData.ogrenciler.map(student => ({
                studentId: student.ogrenciNo,
                name: student.ad,
                surname: student.soyad,
                status: student.durum || 'Aktif'
            }));
            
            // ogrenciNotlari formatı
            if (jsonData.ogrenciNotlari) {
                gradesData = jsonData.ogrenciNotlari;
            }
        } 
        else if (jsonData.students && Array.isArray(jsonData.students)) {
            // Format 2: Normal/İngilizce format
            studentData = jsonData.students.map(student => ({
                studentId: student.student_id || student.studentId || student.ogrenciNo,
                name: student.name || student.ad,
                surname: student.surname || student.soyad,
                status: student.status || student.durum || 'Aktif'
            }));
            
            // grades veya rawGrades formatı
            if (jsonData.grades) {
                gradesData = jsonData.grades;
            } else if (jsonData.rawGrades) {
                gradesData = jsonData.rawGrades;
            }
        } 
        else if (jsonData.courseData && jsonData.courseData.ogrenciler) {
            // Format 3: Excel-to-MUDEK formatı
            studentData = jsonData.courseData.ogrenciler.map(student => ({
                studentId: student.ogrenciNo,
                name: student.ad,
                surname: student.soyad,
                status: student.durum || 'Aktif'
            }));
        } 
        else {
            throw new Error('Geçerli öğrenci verisi bulunamadı.');
        }
        
        if (!studentData.length) {
            throw new Error('Öğrenci listesi boş.');
        }
        
        // Öğrenci verilerini kaydet
        APP_STATE.studentData = studentData;
        
        // Öğrenci tablosunu güncelle
        updateStudentTable();
        
        // Not verilerini de yükle
        if (Object.keys(gradesData).length > 0) {
            APP_STATE.gradesData = gradesData;
        }
        
        // Değerlendirme görünümünü güncelle
        updateAssessmentView();
        
        // Değerlendirme sekmesine geç
        switchTab('assessment');
        
        showModernToast(`${APP_STATE.studentData.length} öğrenci başarıyla yüklendi.`);
    } catch (error) {
        console.error("Öğrenci verileri içe aktarılırken hata oluştu:", error);
        showModernToast("Öğrenci verileri içe aktarılamadı! Lütfen dosya formatını kontrol edin.", "error");
        throw error;
    }
}

// =====================================================
// JSON VE DOSYA İŞLEMLERİ
// =====================================================

/**
 * Not verilerini içe aktarma
 */
function importGrades() {
    try {
        // Not girişlerinin kontrolü
        if (!APP_STATE.assessmentTree.length || !APP_STATE.studentData.length) {
            showModernToast("Değerlendirme kriterleri ve öğrenci listesi yüklenmeden not girişi yapılamaz!", "warning");
            return;
        }
        
        // Not içe aktarma modalını göster
        openModal(importModal);
        
        // Modalda açıklama ekle
        jsonContent.value = "";
        jsonContent.placeholder = "Not verilerini JSON formatında yapıştırın veya dosyadan yükleyin.\n\n" +
            "Örnek format:\n{\n  \"12345\": {\n    \"A1\": 85,\n    \"F1\": 75\n  }\n}";
            
        // Modalın başlığını değiştir
        document.querySelector('#importModal .modal-header h2').textContent = "Notları İçe Aktar";
        
        // Apply butonuna farklı bir işlev ata
        btnApplyJson.onclick = function() {
            applyGradesJson();
        };
        
    } catch (error) {
        console.error("Not içe aktarma modalı gösterilirken hata oluştu:", error);
        showModernToast("Not içe aktarma işlemi başlatılamadı!", "error");
    }
}

/**
 * Not JSON verilerini uygulama
 */
function applyGradesJson() {
    try {
        const jsonString = jsonContent.value.trim();
        
        if (!jsonString) {
            showModernToast("Lütfen geçerli bir JSON içeriği girin.", "warning");
            return;
        }
        
        const jsonData = JSON.parse(jsonString);
        
        // Temel doğrulama
        if (!jsonData || typeof jsonData !== 'object') {
            throw new Error('Geçersiz JSON formatı.');
        }
        
        // Not verilerini yükle
        if (jsonData.grades) {
            APP_STATE.gradesData = jsonData.grades;
        } else if (jsonData.ogrenciNotlari) {
            APP_STATE.gradesData = jsonData.ogrenciNotlari;
        } else if (jsonData.rawGrades) {
            APP_STATE.gradesData = jsonData.rawGrades;
        } else {
            // Doğrudan not verisi olarak kabul et
            APP_STATE.gradesData = jsonData;
        }
        
        // JSON yüklendikten sonra alanları uyumlu hale getir
        normalizeGradeFields();
        
        // Değerlendirme görünümünü güncelle
        updateAssessmentView();
        
        closeModal(importModal);
        showModernToast("Not verileri başarıyla yüklendi.");
        
        // Değerlendirme sekmesine geç
        switchTab('assessment');
        
    } catch (error) {
        console.error("Not JSON verisi uygulanırken hata oluştu:", error);
        showModernToast("Not verileri yüklenemedi: " + error.message, "error");
    }
}
/**
 * Not verilerini kaydetme
 */
function saveGrades() {
    try {
        // Not girişlerinin kontrolü
        if (!APP_STATE.assessmentTree.length || !APP_STATE.studentData.length) {
            showModernToast("Değerlendirme kriterleri ve öğrenci listesi yüklenmeden not kaydı yapılamaz!", "warning");
            return;
        }
        
        // Notları kaydet - dosya sisteminde kalıcı olarak saklanmasına gerek yok,
        // çünkü zaten APP_STATE.gradesData içinde tutuluyorlar
        
        showModernToast("Notlar başarıyla kaydedildi.");
        
        // İsteğe bağlı olarak notları JSON olarak dışa aktarma modalını göster
        showExportGradesModal('json');
    } catch (error) {
        console.error("Notlar kaydedilirken hata oluştu:", error);
        showModernToast("Notlar kaydedilemedi!", "error");
    }
}

/**
 * Not dışa aktarma modalını gösterme
 * @param {string} type - Dışa aktarma tipi (json/csv)
 */
function showExportGradesModal(type) {
    try {
        // Tip kontrolü
        if (type !== 'json' && type !== 'csv') {
            throw new Error('Geçersiz dışa aktarma tipi!');
        }
        
        // İçerik oluştur
        let content = '';
        
        if (type === 'json') {
            // JSON verisi oluştur
            const gradesData = createGradesExportData();
            content = JSON.stringify(gradesData, null, 2);
        } else {
            // CSV verisi oluştur
            content = createGradesCSV();
        }
        
        // Modal içeriğini ayarla
        exportGradesContent.value = content;
        
        // Modalı göster
        openModal(exportGradesModal);
        
        showModernToast(`Notlar ${type.toUpperCase()} formatında hazırlandı.`);
    } catch (error) {
        console.error("Not dışa aktarma modalı gösterilirken hata oluştu:", error);
        showModernToast("Not verileri dışa aktarılamadı!", "error");
    }
}

/**
 * JSON verisini uygulama - Tüm formatları destekler
 */
function applyJsonData() {
    try {
        const jsonString = jsonContent.value.trim();
        
        if (!jsonString) {
            showModernToast("Lütfen geçerli bir JSON içeriği girin.", "warning");
            return;
        }
        
        const jsonData = JSON.parse(jsonString);
        
        // Temel doğrulama
        if (!jsonData || typeof jsonData !== 'object') {
            throw new Error('Geçersiz JSON formatı.');
        }
        
        // Ders verilerini kaydet
        APP_STATE.courseData = jsonData;
        
        // Öğrenme çıktılarını ayarla
        if (jsonData.dersOgrenmeÇiktilari && Array.isArray(jsonData.dersOgrenmeÇiktilari)) {
            APP_STATE.learningOutcomes = jsonData.dersOgrenmeÇiktilari;
            renderOutcomes();
        }
        
        // Ders bilgilerini güncelle
        updateCourseInfo();
        
        // Değerlendirme ağacı için veri yapısı oluştur
        if (jsonData.assessmentTree || jsonData.degerlendirmeAgaci) {
            // Doğrudan ağacı al (eğer daha önce kaydedilmişse)
            APP_STATE.assessmentTree = jsonData.assessmentTree || jsonData.degerlendirmeAgaci;
        } else {
            // Ders verilerinden ağaç oluştur
            createAssessmentTreeFromCourseData();
        }
        
        // Ağacı render et
        renderTree();
        
        // Öğrencileri içe aktar
        let hasStudentData = false;
        
        // Format 1: ogrenciler dizisi
        if (jsonData.ogrenciler && Array.isArray(jsonData.ogrenciler)) {
            APP_STATE.studentData = jsonData.ogrenciler.map(student => ({
                studentId: student.ogrenciNo,
                name: student.ad,
                surname: student.soyad,
                status: student.durum || 'Aktif'
            }));
            hasStudentData = true;
        } 
        // Format 2: students dizisi
        else if (jsonData.students && Array.isArray(jsonData.students)) {
            APP_STATE.studentData = jsonData.students.map(student => ({
                studentId: student.studentId || student.student_id || student.ogrenciNo,
                name: student.name || student.ad,
                surname: student.surname || student.soyad, 
                status: student.status || student.durum || 'Aktif'
            }));
            hasStudentData = true;
        }
        // Format 3: courseData.ogrenciler
        else if (jsonData.courseData && jsonData.courseData.ogrenciler && Array.isArray(jsonData.courseData.ogrenciler)) {
            APP_STATE.studentData = jsonData.courseData.ogrenciler.map(student => ({
                studentId: student.ogrenciNo,
                name: student.ad,
                surname: student.soyad,
                status: student.durum || 'Aktif'
            }));
            hasStudentData = true;
        }
        
        // Öğrenci notları yükleme - ÖNEMLİ: not verilerini içe aktarma kısmı
        APP_STATE.gradesData = {}; // Not verilerini sıfırla
        
        if (hasStudentData) {
            // Format 1: ogrenciNotlari
            if (jsonData.ogrenciNotlari && typeof jsonData.ogrenciNotlari === 'object') {
                APP_STATE.gradesData = JSON.parse(JSON.stringify(jsonData.ogrenciNotlari));
            }
            // Format 2: grades
            else if (jsonData.grades && typeof jsonData.grades === 'object') {
                APP_STATE.gradesData = JSON.parse(JSON.stringify(jsonData.grades));
            }
            // Format 3: rawGrades
            else if (jsonData.rawGrades && typeof jsonData.rawGrades === 'object') {
                APP_STATE.gradesData = JSON.parse(JSON.stringify(jsonData.rawGrades));
            }
            
            // Alan adlarını normalleştir - test notları için
            normalizeGradeFields();
            
            // Öğrenci tablosunu güncelle
            updateStudentTable();
        }
        
        // Değerlendirme görünümünü güncelle
        updateAssessmentView();
        
        closeModal(importModal);
        showModernToast("JSON verisi başarıyla yüklendi.");
        
        // Öğrenci verileri yüklendiyse değerlendirme sekmesine geç
        if (hasStudentData) {
            setTimeout(() => {
                switchTab('assessment');
            }, 500);
        }
        
    } catch (error) {
        console.error("JSON verisi uygulanırken hata oluştu:", error);
        showModernToast("JSON verisi uygulanamadı: " + error.message, "error");
    }
}

/**
 * Öğrenci JSON verilerini uygulama
 */
function applyStudentJsonData() {
    try {
        const jsonData = JSON.parse(studentJsonContent.value);
        
        // Öğrenci verilerini içe aktar
        importStudentData(jsonData);
        
        closeModal(importStudentsModal);
        showModernToast("Öğrenci listesi başarıyla yüklendi.");
    } catch (error) {
        console.error("Öğrenci JSON verisi uygulanırken hata oluştu:", error);
        showModernToast("Öğrenci listesi yüklenemedi! Lütfen dosya formatını kontrol edin.", "error");
    }
}

/**
 * Ders verilerinden değerlendirme ağacı oluşturma
 */
function createAssessmentTreeFromCourseData() {
    try {
        // Temiz bir ağaç yapısı oluştur
        APP_STATE.assessmentTree = [];
        
        if (!APP_STATE.courseData) return;
        
        // Derste tanımlı değerlendirme etkinliklerini kontrol et
        const assessmentActivities = APP_STATE.courseData.dersDegerlendirme?.yariyilIciEtkinlikleri || [];
        const finalActivities = APP_STATE.courseData.dersDegerlendirme?.yariyilSonuEtkinlikleri || [];
        
        // Yarıyıl içi etkinlikler
        if (assessmentActivities.length > 0) {
            assessmentActivities.forEach((activity, index) => {
                const activityId = `A${index + 1}`;
                
                // ÖÇ'leri rastgele seç (gerçek bir uygulamada doğru ÖÇ eşleştirmesi yapılmalıdır)
                const randomOutcomes = getRandomOutcomes(2);
                
                const node = {
                    id: activityId,
                    name: activity.etkinlik,
                    type: activity.etkinlik,
                    weight: activity.katkiYuzdesi,
                    points: 100,
                    outcomes: randomOutcomes,
                    description: 'Yarıyıl içi değerlendirme',
                    expanded: true,
                    children: []
                };
                
                // Varsa alt etkinlikleri ekle
                if (APP_STATE.courseData.assessmentDetails && APP_STATE.courseData.assessmentDetails[activityId]) {
                    const details = APP_STATE.courseData.assessmentDetails[activityId];
                    if (details.children && Array.isArray(details.children)) {
                        node.children = details.children;
                    }
                } else {
                    // Varsayılan olarak bazı soru ve rubrikler ekle
                    if (activity.etkinlik === 'Ara Sınav' || activity.etkinlik === 'Quiz') {
                        // Örnek sorular ekle
                        for (let i = 1; i <= 5; i++) {
                            const questionOutcome = randomOutcomes.length > 0 ? [randomOutcomes[i % randomOutcomes.length]] : [];
                            
                            node.children.push({
                                id: `${activityId}.${i}`,
                                name: `Soru ${i}`,
                                type: 'Soru',
                                weight: 20,
                                points: 20,
                                outcomes: questionOutcome,
                                description: 'Değerlendirme sorusu',
                                expanded: false,
                                children: []
                            });
                        }
                    } else if (activity.etkinlik === 'Proje Hazırlama' || activity.etkinlik === 'Rapor' || activity.etkinlik === 'Ev Ödevi') {
                        // Örnek rubrikler ekle
                        const rubricTypes = [
                            { name: 'İçerik', desc: 'İçerik kalitesi ve kapsamı' },
                            { name: 'Organizasyon', desc: 'Çalışmanın düzeni ve yapısı' },
                            { name: 'Sunum', desc: 'Sunum kalitesi ve profesyonellik' },
                            { name: 'Kaynaklar', desc: 'Kaynakların kullanımı ve atıf yapılması' },
                            { name: 'Özgünlük', desc: 'Çalışmanın özgünlük düzeyi' }
                        ];
                        
                        rubricTypes.forEach((rubric, idx) => {
                            const rubricOutcome = randomOutcomes.length > 0 ? [randomOutcomes[idx % randomOutcomes.length]] : [];
                            
                            node.children.push({
                                id: `${activityId}.${idx + 1}`,
                                name: rubric.name,
                                type: 'Rubrik',
                                weight: 20,
                                points: 20,
                                outcomes: rubricOutcome,
                                description: rubric.desc,
                                expanded: false,
                                children: []
                            });
                        });
                    }
                }
                
                APP_STATE.assessmentTree.push(node);
            });
        } else {
            // Varsayılan bir yarıyıl içi etkinlik ekle
            APP_STATE.assessmentTree.push({
                id: 'A1',
                name: 'Ara Sınav',
                type: 'Ara Sınav',
                weight: 40,
                points: 100,
                outcomes: getRandomOutcomes(3),
                description: 'Yarıyıl içi değerlendirme',
                expanded: true,
                children: []
            });
        }
        
        // Yarıyıl sonu etkinlikler
        if (finalActivities.length > 0) {
            finalActivities.forEach((activity, index) => {
                const activityId = `F${index + 1}`;
                
                // ÖÇ'leri rastgele seç
                const randomOutcomes = getRandomOutcomes(3);
                
                const node = {
                    id: activityId,
                    name: activity.etkinlik,
                    type: activity.etkinlik,
                    weight: activity.katkiYuzdesi,
                    points: 100,
                    outcomes: randomOutcomes,
                    description: 'Yarıyıl sonu değerlendirme',
                    expanded: true,
                    children: []
                };
                
                // Varsa alt etkinlikleri ekle
                if (APP_STATE.courseData.assessmentDetails && APP_STATE.courseData.assessmentDetails[activityId]) {
                    const details = APP_STATE.courseData.assessmentDetails[activityId];
                    if (details.children && Array.isArray(details.children)) {
                        node.children = details.children;
                    }
                } else {
                    // Final sınavı için örnek sorular ekle
                    if (activity.etkinlik === 'Final Sınavı') {
                        for (let i = 1; i <= 5; i++) {
                            const questionOutcome = randomOutcomes.length > 0 ? [randomOutcomes[i % randomOutcomes.length]] : [];
                            
                            node.children.push({
                                id: `${activityId}.${i}`,
                                name: `Soru ${i}`,
                                type: 'Soru',
                                weight: 20,
                                points: 20,
                                outcomes: questionOutcome,
                                description: 'Değerlendirme sorusu',
                                expanded: false,
                                children: []
                            });
                        }
                    }
                }
                
                APP_STATE.assessmentTree.push(node);
            });
        } else {
            // Varsayılan bir yarıyıl sonu etkinlik ekle
            APP_STATE.assessmentTree.push({
                id: 'F1',
                name: 'Final Sınavı',
                type: 'Final Sınavı',
                weight: 60,
                points: 100,
                outcomes: getRandomOutcomes(4),
                description: 'Yarıyıl sonu değerlendirme',
                expanded: true,
                children: []
            });
        }
    } catch (error) {
        console.error("Değerlendirme ağacı oluşturulurken hata oluştu:", error);
        showModernToast("Değerlendirme ağacı oluşturulamadı!", "error");
    }
}

/**
 * Dışa aktarılacak JSON verisi oluştur
 * @returns {Object} - Dışa aktarılacak veri
 */
function createExportData() {
    try {
        // Tarih ve zaman bilgisi
        const now = new Date();
        const formattedDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
        
        // Dışa aktarılacak veri yapısı - tamamen Türkçe anahtar isimlerini kullanıyor
        const exportData = {
            disaAktarmaTarihi: now.toISOString(),
            dersBilgisi: {
                dersKodu: APP_STATE.courseData?.dersGenel?.dersKodu || '',
                dersAdi: APP_STATE.courseData?.dersGenel?.dersAdi || '',
                akademikYil: APP_STATE.courseData?.dersGenel?.akademikYil || '',
                donem: APP_STATE.courseData?.dersGenel?.ogretimYiliDonemi || 'Bahar Dönemi',
                ogretimUyesi: APP_STATE.courseData?.dersIcerik?.dersiVerenOgretimUyesiOgretimGorevlisi || ''
            },
            ogrenciler: APP_STATE.studentData.map(student => ({
                ogrenciNo: student.studentId,
                ad: student.name,
                soyad: student.surname,
                durum: student.status || 'Aktif'
            })),
            dersDegerlendirme: {
                yariyilIciEtkinlikleri: APP_STATE.assessmentTree.filter(node => node.id.startsWith('A')).map(node => ({
                    etkinlik: node.type,
                    sayi: 1,
                    katkiYuzdesi: node.weight,
                    id: node.id,
                    detaylar: node.children && node.children.map(child => ({
                        id: child.id,
                        isim: child.name,
                        tip: child.type,
                        agirlik: child.weight,
                        puan: child.points,
                        ogrenmeÇiktilari: child.outcomes || [],
                        aciklama: child.description
                    })) || []
                })),
                yariyilIciToplam: 100,
                yariyilSonuEtkinlikleri: APP_STATE.assessmentTree.filter(node => node.id.startsWith('F')).map(node => ({
                    etkinlik: node.type,
                    sayi: 1,
                    katkiYuzdesi: node.weight,
                    id: node.id,
                    detaylar: node.children && node.children.map(child => ({
                        id: child.id,
                        isim: child.name,
                        tip: child.type,
                        agirlik: child.weight,
                        puan: child.points,
                        ogrenmeÇiktilari: child.outcomes || [],
                        aciklama: child.description
                    })) || []
                })),
                yariyilSonuToplam: 100,
                genelDegerlendirme: [
                    {
                        degerlendirme: "Yarıyıl (Yıl) Sonu Etkinlikleri",
                        katkiYuzdesi: APP_STATE.finalWeight
                    },
                    {
                        degerlendirme: "Yarıyıl (Yıl) İçi Etkinlikleri",
                        katkiYuzdesi: APP_STATE.termWeight
                    }
                ],
                genelDegerlendirmeToplam: 100
            },
            // Öğrenci notlarını tam olarak kopyalayarak dahil et
            ogrenciNotlari: JSON.parse(JSON.stringify(APP_STATE.gradesData || {})),
            
            // Genel ders bilgileri
            dersGenel: APP_STATE.courseData?.dersGenel || {},
            dersIcerik: APP_STATE.courseData?.dersIcerik || {},
            
            // Öğrenme çıktıları varsa ekle
            dersOgrenmeÇiktilari: APP_STATE.learningOutcomes.map(outcome => ({
                id: outcome.id,
                aciklama: outcome.aciklama
            })),
            
            // Değerlendirme ağacını ekle
            degerlendirmeAgaci: APP_STATE.assessmentTree,
            
            // Denetim bilgileri
            denetimBilgileri: {
                olusturmaTarihi: APP_STATE.courseData?.denetimBilgileri?.olusturmaTarihi || formattedDateTime,
                olusturan: APP_STATE.courseData?.denetimBilgileri?.olusturan || 'Ders Değerlendirme Sistemi',
                sonGuncellenmeTarihi: formattedDateTime,
                guncelleyen: 'Ders Değerlendirme Sistemi',
                durum: 'Taslak'
            }
        };
        
        // Ders Genel ve İçerik bilgilerini APP_STATE'den al
        if (APP_STATE.courseData) {
            if (APP_STATE.courseData.dersGenel) {
                exportData.dersGenel = JSON.parse(JSON.stringify(APP_STATE.courseData.dersGenel));
            }
            
            if (APP_STATE.courseData.dersIcerik) {
                exportData.dersIcerik = JSON.parse(JSON.stringify(APP_STATE.courseData.dersIcerik));
            }
            
            // Diğer önemli bilgileri koru
            if (APP_STATE.courseData.haftalikDersIcerikleri) {
                exportData.haftalikDersIcerikleri = JSON.parse(JSON.stringify(APP_STATE.courseData.haftalikDersIcerikleri));
            }
            
            if (APP_STATE.courseData.dersIsYuku) {
                exportData.dersIsYuku = JSON.parse(JSON.stringify(APP_STATE.courseData.dersIsYuku));
            }
            
            if (APP_STATE.courseData.programCiktilari) {
                exportData.programCiktilari = JSON.parse(JSON.stringify(APP_STATE.courseData.programCiktilari));
            }
            
            if (APP_STATE.courseData.programVeOgrenmeIliskisi) {
                exportData.programVeOgrenmeIliskisi = JSON.parse(JSON.stringify(APP_STATE.courseData.programVeOgrenmeIliskisi));
            }
            
            if (APP_STATE.courseData.toplumsalKatkiVeSurdurulebilirlik) {
                exportData.toplumsalKatkiVeSurdurulebilirlik = JSON.parse(JSON.stringify(APP_STATE.courseData.toplumsalKatkiVeSurdurulebilirlik));
            }
            
            if (APP_STATE.courseData.dersSekmeler) {
                exportData.dersSekmeler = JSON.parse(JSON.stringify(APP_STATE.courseData.dersSekmeler));
            }
            
            if (APP_STATE.courseData.numaralandirmaDegerleri) {
                exportData.numaralandirmaDegerleri = JSON.parse(JSON.stringify(APP_STATE.courseData.numaralandirmaDegerleri));
            }
        }
        
        return exportData;
    } catch (error) {
        console.error("Dışa aktarılacak veri oluşturulurken hata oluştu:", error);
        showModernToast("Dışa aktarılacak veri oluşturulamadı!", "error");
        return {};
    }
}

/**
 * Notları JSON olarak dışa aktarma
 * @returns {Object} - Dışa aktarılacak not verisi
 */
function createGradesExportData() {
    try {
        // Notları Türkçe anahtar isimli ogrenciNotlari formatında export et
        const exportData = {
            disaAktarmaTarihi: new Date().toISOString(),
            dersBilgisi: {
                dersKodu: APP_STATE.courseData?.dersGenel?.dersKodu || '',
                dersAdi: APP_STATE.courseData?.dersGenel?.dersAdi || '',
                akademikYil: APP_STATE.courseData?.dersGenel?.akademikYil || '',
                donem: APP_STATE.courseData?.dersGenel?.ogretimYiliDonemi || 'Bahar Dönemi',
                ogretimUyesi: APP_STATE.courseData?.dersIcerik?.dersiVerenOgretimUyesiOgretimGorevlisi || ''
            },
            ogrenciler: APP_STATE.studentData.map(student => ({
                ogrenciNo: student.studentId,
                ad: student.name,
                soyad: student.surname,
                durum: student.status || 'Aktif'
            })),
            // Notları doğrudan kullan
            ogrenciNotlari: APP_STATE.gradesData || {}
        };
        
        // Her öğrenci için hesaplanmış notları ekle
        APP_STATE.studentData.forEach(student => {
            const studentId = student.studentId;
            
            // Yarıyıl içi etkinlikler
            const termActivities = APP_STATE.assessmentTree.filter(node => node.id.startsWith('A'));
            let termGrade = 0;
            
            termActivities.forEach(activity => {
                const activityWeight = activity.weight / APP_STATE.termWeight; // Normalize
                let activityGrade = 0;
                
                if (activity.children && activity.children.length > 0) {
                    // Alt etkinlikler
                    activity.children.forEach(subItem => {
                        const subItemWeight = subItem.weight / 100; // subItem içinde normalize
                        const grade = getStudentGrade(studentId, subItem.id) || 0;
                        const scaledGrade = (grade / subItem.points) * 100; // 100 üzerinden
                        activityGrade += scaledGrade * subItemWeight;
                    });
                } else {
                    // Basit etkinlik
                    const grade = getStudentGrade(studentId, activity.id) || 0;
                    activityGrade = (grade / activity.points) * 100; // 100 üzerinden
                }
                
                termGrade += activityGrade * activityWeight;
            });
            
            // Yarıyıl sonu etkinlikler
            const finalActivities = APP_STATE.assessmentTree.filter(node => node.id.startsWith('F'));
            let finalGrade = 0;
            
            finalActivities.forEach(activity => {
                const activityWeight = activity.weight / APP_STATE.finalWeight; // Normalize
                let activityGrade = 0;
                
                if (activity.children && activity.children.length > 0) {
                    // Alt etkinlikler
                    activity.children.forEach(subItem => {
                        const subItemWeight = subItem.weight / 100; // subItem içinde normalize
                        const grade = getStudentGrade(studentId, subItem.id) || 0;
                        const scaledGrade = (grade / subItem.points) * 100; // 100 üzerinden
                        activityGrade += scaledGrade * subItemWeight;
                    });
                } else {
                    // Basit etkinlik
                    const grade = getStudentGrade(studentId, activity.id) || 0;
                    activityGrade = (grade / activity.points) * 100; // 100 üzerinden
                }
                
                finalGrade += activityGrade * activityWeight;
            });
            
            // Toplam ve harf notu
            const totalGrade = (termGrade * APP_STATE.termWeight / 100) + (finalGrade * APP_STATE.finalWeight / 100);
            const letterGrade = getLetterGrade(totalGrade);
            
            // Öğrenci notları nesnesini oluştur
            if (!APP_STATE.gradesData[studentId]) {
                APP_STATE.gradesData[studentId] = {};
            }
            
            // Yarıyıl içi, sonu ve toplam not bilgilerini ekle
            APP_STATE.gradesData[studentId].yariyilIciNotu = parseFloat(termGrade.toFixed(2));
            APP_STATE.gradesData[studentId].yariyilSonuNotu = parseFloat(finalGrade.toFixed(2));
            APP_STATE.gradesData[studentId].basariNotu = parseFloat(totalGrade.toFixed(2));
            APP_STATE.gradesData[studentId].harfNotu = letterGrade;
        });
        
        // En son gradesData ekle
        exportData.ogrenciNotlari = APP_STATE.gradesData;
        
        return exportData;
    } catch (error) {
        console.error("Not verileri dışa aktarılırken hata oluştu:", error);
        showModernToast("Not verileri dışa aktarılamadı!", "error");
        return {};
    }
}

/**
 * Notları CSV olarak dışa aktarma
 * @returns {string} - CSV formatındaki not verisi
 */
function createGradesCSV() {
    try {
        // Final notlarını hesapla
        const finalGrades = {};
        
        APP_STATE.studentData.forEach(student => {
            const studentId = student.studentId;
            
            // Yarıyıl içi etkinlikler
            const termActivities = APP_STATE.assessmentTree.filter(node => node.id.startsWith('A'));
            let termGrade = 0;
            
            termActivities.forEach(activity => {
                const activityWeight = activity.weight / APP_STATE.termWeight; // Normalize
                let activityGrade = 0;
                
                if (activity.children && activity.children.length > 0) {
                    // Alt etkinlikler
                    activity.children.forEach(subItem => {
                        const subItemWeight = subItem.weight / 100; // subItem içinde normalize
                        const grade = getStudentGrade(studentId, subItem.id) || 0;
                        const scaledGrade = (grade / subItem.points) * 100; // 100 üzerinden
                        activityGrade += scaledGrade * subItemWeight;
                    });
                } else {
                    // Basit etkinlik
                    const grade = getStudentGrade(studentId, activity.id) || 0;
                    activityGrade = (grade / activity.points) * 100; // 100 üzerinden
                }
                
                termGrade += activityGrade * activityWeight;
            });
            
            // Yarıyıl sonu etkinlikler
            const finalActivities = APP_STATE.assessmentTree.filter(node => node.id.startsWith('F'));
            let finalGrade = 0;
            
            finalActivities.forEach(activity => {
                const activityWeight = activity.weight / APP_STATE.finalWeight; // Normalize
                let activityGrade = 0;
                
                if (activity.children && activity.children.length > 0) {
                    // Alt etkinlikler
                    activity.children.forEach(subItem => {
                        const subItemWeight = subItem.weight / 100; // subItem içinde normalize
                        const grade = getStudentGrade(studentId, subItem.id) || 0;
                        const scaledGrade = (grade / subItem.points) * 100; // 100 üzerinden
                        activityGrade += scaledGrade * subItemWeight;
                    });
                } else {
                    // Basit etkinlik
                    const grade = getStudentGrade(studentId, activity.id) || 0;
                    activityGrade = (grade / activity.points) * 100; // 100 üzerinden
                }
                
                finalGrade += activityGrade * activityWeight;
            });
            
            // Toplam ve harf notu
            const totalGrade = (termGrade * APP_STATE.termWeight / 100) + (finalGrade * APP_STATE.finalWeight / 100);
            const letterGrade = getLetterGrade(totalGrade);
            
            finalGrades[studentId] = {
                termGrade: termGrade.toFixed(2),
                finalGrade: finalGrade.toFixed(2),
                totalGrade: totalGrade.toFixed(2),
                letterGrade: letterGrade
            };
        });
        
        // CSV başlık satırı
        let csv = "Öğrenci No,Adı,Soyadı,Durum,Yarıyıl İçi,Yarıyıl Sonu,Toplam,Harf Notu\n";
        
        // Her öğrenci için satır ekle
        APP_STATE.studentData.forEach(student => {
            const studentGrade = finalGrades[student.studentId] || {
                termGrade: "0.00",
                finalGrade: "0.00",
                totalGrade: "0.00",
                letterGrade: "FF"
            };
            
            csv += `${student.studentId},${student.name},${student.surname},${student.status || 'Aktif'},${studentGrade.termGrade},${studentGrade.finalGrade},${studentGrade.totalGrade},${studentGrade.letterGrade}\n`;
        });
        
        return csv;
    } catch (error) {
        console.error("CSV oluşturulurken hata oluştu:", error);
        showModernToast("CSV oluşturulamadı!", "error");
        return '';
    }
}

/**
 * JSON verisini panoya kopyala
 */
function copyJsonToClipboard() {
    try {
        exportJsonContent.select();
        document.execCommand('copy');
        showModernToast("JSON verisi panoya kopyalandı.");
    } catch (error) {
        console.error("JSON verisi kopyalanırken hata oluştu:", error);
        showModernToast("JSON verisi kopyalanamadı!", "error");
    }
}

/**
 * Notları panoya kopyala
 */
function copyGradesToClipboard() {
    try {
        exportGradesContent.select();
        document.execCommand('copy');
        showModernToast("Not verileri panoya kopyalandı.");
    } catch (error) {
        console.error("Not verileri kopyalanırken hata oluştu:", error);
        showModernToast("Not verileri kopyalanamadı!", "error");
    }
}

/**
 * JSON verisini dosyaya kaydet
 */
function saveJsonToFile() {
    try {
        const jsonData = exportJsonContent.value;
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        
        // Eğer orijinal dosya adı varsa kullan, yoksa yeni bir ad oluştur
        if (APP_STATE.jsonFileName) {  // jsonFileName -> APP_STATE.jsonFileName
            a.download = APP_STATE.jsonFileName;
        } else {
            const dersKodu = APP_STATE.courseData?.dersGenel?.dersKodu || 'ders';
            a.download = `${dersKodu}_degerlendirme.json`;
        }
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showModernToast("JSON dosyası başarıyla kaydedildi.");
    } catch (error) {
        console.error("JSON dosyası kaydedilirken hata oluştu:", error);
        showModernToast("JSON dosyası kaydedilemedi!", "error");
    }
}


/**
 * Dosya yükleme işlemi
 * @param {Event} event - Dosya seçme olayı
 */
function loadJsonFromFile(event) {
    try {
        const file = event.target.files[0];
        if (!file) {
            showModernToast("Dosya seçilmedi.", "warning");
            return;
        }
        
        APP_STATE.jsonFileName = file.name;
        selectedFileName.textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                jsonContent.value = e.target.result;
                showModernToast("Dosya başarıyla yüklendi. Uygulamak için 'Uygula' butonuna tıklayın.");
            } catch (error) {
                console.error("Dosya okuma hatası:", error);
                showModernToast("Dosya okunamadı: " + error.message, "error");
            }
        };
        
        reader.onerror = function() {
            showModernToast("Dosya okuma hatası oluştu.", "error");
        };
        
        reader.readAsText(file);
    } catch (error) {
        console.error("Dosya yükleme hatası:", error);
        showModernToast("Dosya yüklenemedi: " + error.message, "error");
    }
}

/**
 * JSON verisini uygulama - Tüm formatları destekler
 */
function applyJsonData() {
    try {
        const jsonString = jsonContent.value.trim();
        
        if (!jsonString) {
            showModernToast("Lütfen geçerli bir JSON içeriği girin.", "warning");
            return;
        }
        
        const jsonData = JSON.parse(jsonString);
        
        // Temel doğrulama
        if (!jsonData || typeof jsonData !== 'object') {
            throw new Error('Geçersiz JSON formatı.');
        }
        
        // Ders verilerini kaydet
        APP_STATE.courseData = jsonData;
        
        // Öğrenme çıktılarını ayarla
        if (jsonData.dersOgrenmeÇiktilari && Array.isArray(jsonData.dersOgrenmeÇiktilari)) {
            APP_STATE.learningOutcomes = jsonData.dersOgrenmeÇiktilari;
            renderOutcomes();
        }
        
        // Ders bilgilerini güncelle
        updateCourseInfo();
        
        // Değerlendirme ağacı için veri yapısı oluştur
        if (jsonData.degerlendirmeAgaci) {
            // Doğrudan ağacı al (eğer daha önce kaydedilmişse)
            APP_STATE.assessmentTree = jsonData.degerlendirmeAgaci;
        } else if (jsonData.assessmentTree) {
            APP_STATE.assessmentTree = jsonData.assessmentTree;
        } else {
            // Ders verilerinden ağaç oluştur
            createAssessmentTreeFromCourseData();
        }
        
        // Ağacı render et
        renderTree();
        
        // Öğrencileri içe aktar
        let hasStudentData = false;
        
        // Format 1: ogrenciler dizisi
        if (jsonData.ogrenciler && Array.isArray(jsonData.ogrenciler)) {
            APP_STATE.studentData = jsonData.ogrenciler.map(student => ({
                studentId: student.ogrenciNo,
                name: student.ad,
                surname: student.soyad,
                status: student.durum || 'Aktif'
            }));
            hasStudentData = true;
        } 
        // Format 2: students dizisi
        else if (jsonData.students && Array.isArray(jsonData.students)) {
            APP_STATE.studentData = jsonData.students.map(student => ({
                studentId: student.studentId || student.student_id || student.ogrenciNo,
                name: student.name || student.ad,
                surname: student.surname || student.soyad, 
                status: student.status || student.durum || 'Aktif'
            }));
            hasStudentData = true;
        }
        // Format 3: courseData.ogrenciler
        else if (jsonData.courseData && jsonData.courseData.ogrenciler && Array.isArray(jsonData.courseData.ogrenciler)) {
            APP_STATE.studentData = jsonData.courseData.ogrenciler.map(student => ({
                studentId: student.ogrenciNo,
                name: student.ad,
                surname: student.soyad,
                status: student.durum || 'Aktif'
            }));
            hasStudentData = true;
        }
        
        // Öğrenci notları yükleme
        if (hasStudentData) {
            // Önce not verilerini sıfırla
            APP_STATE.gradesData = {};
            
            // Format 1: ogrenciNotlari (en yaygın format)
            if (jsonData.ogrenciNotlari && typeof jsonData.ogrenciNotlari === 'object') {
                // Tam olarak kopyala - derin kopya
                APP_STATE.gradesData = JSON.parse(JSON.stringify(jsonData.ogrenciNotlari));
            }
            // Format 2: grades
            else if (jsonData.grades && typeof jsonData.grades === 'object') {
                // Tam olarak kopyala - derin kopya
                APP_STATE.gradesData = JSON.parse(JSON.stringify(jsonData.grades));
            }
            // Format 3: rawGrades
            else if (jsonData.rawGrades && typeof jsonData.rawGrades === 'object') {
                // Tam olarak kopyala - derin kopya
                APP_STATE.gradesData = JSON.parse(JSON.stringify(jsonData.rawGrades));
            }
            
            // Öğrenci tablosunu güncelle
            updateStudentTable();
        }
        
        // Değerlendirme görünümünü güncelle
        updateAssessmentView();
        
        closeModal(importModal);
        showModernToast("JSON verisi başarıyla yüklendi.");
        
        // Öğrenci verileri yüklendiyse değerlendirme sekmesine geç
        if (hasStudentData) {
            setTimeout(() => {
                switchTab('assessment');
            }, 500);
        }
        
    } catch (error) {
        console.error("JSON verisi uygulanırken hata oluştu:", error);
        showModernToast("JSON verisi uygulanamadı: " + error.message, "error");
    }
}

/**
 * Öğrenci dosyasını yükleme
 * @param {Event} event - Dosya seçme olayı
 */
function loadStudentJsonFromFile(event) {
    try {
        const file = event.target.files[0];
        if (!file) {
            showModernToast("Dosya seçilmedi.", "warning");
            return;
        }
        
        selectedStudentFileName.textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                studentJsonContent.value = e.target.result;
                showModernToast("Öğrenci dosyası başarıyla yüklendi. Uygulamak için 'Uygula' butonuna tıklayın.");
            } catch (error) {
                console.error("Dosya okuma hatası:", error);
                showModernToast("Dosya okunamadı: " + error.message, "error");
            }
        };
        
        reader.onerror = function() {
            showModernToast("Dosya okuma hatası oluştu.", "error");
        };
        
        reader.readAsText(file);
    } catch (error) {
        console.error("Öğrenci dosyası yükleme hatası:", error);
        showModernToast("Öğrenci dosyası yüklenemedi: " + error.message, "error");
    }
}

/**
 * Öğrenci dosyasını doğrudan yükleme
 * @param {Event} event - Dosya seçme olayı
 */
function loadStudentsFromFile(event) {
    try {
        const file = event.target.files[0];
        if (!file) {
            showModernToast("Dosya seçilmedi.", "warning");
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                importStudentData(jsonData);
                showModernToast("Öğrenci listesi başarıyla yüklendi.");
            } catch (error) {
                console.error("Öğrenci verisi işleme hatası:", error);
                showModernToast("Öğrenci dosyası işlenemedi: " + error.message, "error");
            }
        };
        
        reader.onerror = function() {
            showModernToast("Dosya okuma hatası oluştu.", "error");
        };
        
        reader.readAsText(file);
    } catch (error) {
        console.error("Öğrenci dosyası yükleme hatası:", error);
        showModernToast("Öğrenci dosyası yüklenemedi: " + error.message, "error");
    }
}

/**
 * Not verilerini dosyaya kaydet
 */
function saveGradesToFile() {
    try {
        const data = exportGradesContent.value;
        
        // İçerik kontrolü
        if (!data || data.trim() === '') {
            showModernToast("Kaydedilecek veri bulunamadı!", "warning");
            return;
        }
        
        const isCSV = data.startsWith("Öğrenci No,Adı");
        const mimeType = isCSV ? 'text/csv' : 'application/json';
        const extension = isCSV ? 'csv' : 'json';
        
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        
        const dersKodu = APP_STATE.courseData?.dersGenel?.dersKodu || 'ders';
        const dateStr = new Date().toISOString().slice(0, 10);
        a.download = `${dersKodu}_notlar_${dateStr}.${extension}`;
        
        document.body.appendChild(a);
        a.click();
        
        // Temizlemeyi geciktir - indirme işleminin başlaması için zaman ver
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 200);
        
        showModernToast(`Not dosyası (.${extension}) başarıyla kaydedildi.`);
    } catch (error) {
        console.error("Not dosyası kaydedilirken hata oluştu:", error);
        showModernToast("Not dosyası kaydedilemedi: " + error.message, "error");
    }
}

/**
 * Test detayları modalını gösterme
 */
function showTestDetailsModal() {
    if (!APP_STATE.testDetailsNode) return;
    
    const node = APP_STATE.testDetailsNode;
    
    totalQuestionsInput.value = node.testDetails?.totalQuestions || 20;
    correctWeightInput.value = node.testDetails?.correctWeight || 5;
    wrongPenaltyInput.value = node.testDetails?.wrongPenalty || 0;
    
    openModal(testDetailsModal);
}

/**
 * Test detaylarını kaydetme
 */
function saveTestDetails() {
    if (!APP_STATE.testDetailsNode) return;
    
    try {
        const totalQuestions = parseInt(totalQuestionsInput.value) || 20;
        const correctWeight = parseFloat(correctWeightInput.value) || 5;
        const wrongPenalty = parseFloat(wrongPenaltyInput.value) || 0;
        
        APP_STATE.testDetailsNode.testDetails = {
            totalQuestions,
            correctWeight,
            wrongPenalty
        };
        
        // Toplam puanı hesapla
        APP_STATE.testDetailsNode.points = totalQuestions * correctWeight;
        
        // Ağacı yeniden render et
        renderTree();
        
        // Değerlendirme sekmesini güncelle
        updateAssessmentView();
        
        // Modalı kapat
        closeModal(testDetailsModal);
        
        showModernToast("Test detayları kaydedildi.");
    } catch (error) {
        console.error("Test detayları kaydedilirken hata oluştu:", error);
        showModernToast("Test detayları kaydedilemedi!", "error");
    }
}

/**
 * Modali açma fonksiyonu
 * @param {HTMLElement} modal - Açılacak modal elementi
 */
function openModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * Modali kapatma fonksiyonu
 * @param {HTMLElement} modal - Kapatılacak modal elementi
 */
function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
    }
}


/**
 * Seçili sekmeyi değiştirme
 * @param {string} tabId - Sekme ID'si
 */
function switchTab(tabId) {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.nav-content');
    
    // Önce tüm tabları pasif yap
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // Seçili tabı aktif yap
    const selectedTab = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
    const selectedContent = document.getElementById(`${tabId}-content`);
    
    if (selectedTab && selectedContent) {
        selectedTab.classList.add('active');
        selectedContent.classList.add('active');
        selectedContent.style.display = 'block';
        APP_STATE.currentActiveTabId = tabId;
        
        // Öğrenci bazlı not girişi sekmesine geçildiğinde öğrenci seçiciyi güncelle
        if (tabId === 'student-grades') {
            updateStudentSelector();
        }
    }
}
/**
 * Tarihi okunabilir formata çevirme
 * @param {string} isoDate - ISO formatlı tarih
 * @returns {string} - Formatlanmış tarih
 */
function formatDate(isoDate) {
    if (!isoDate) return '';
    
    const date = new Date(isoDate);
    return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Dosya adından uzantıyı çıkarma
 * @param {string} filename - Dosya adı
 * @returns {string} - Uzantısız dosya adı
 */
function removeExtension(filename) {
    if (!filename) return '';
    return filename.replace(/\.[^/.]+$/, "");
}

// =====================================================
// EVENT LISTENERS VE GLOBAL FONKSİYONLAR
// =====================================================

// Global scope'a fonksiyonları ekle
window.updateStudentGrade = updateStudentGrade;
window.updateTestScore = updateTestScore;
window.updateStudentGradeFromStudentView = updateStudentGradeFromStudentView;
window.updateTestScoreFromStudentView = updateTestScoreFromStudentView;

// Tüm olay dinleyicileri ayarla
// Tüm olay dinleyicileri ayarla
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Öğrenci not sekmesi butonları
        if (btnImportGradesStudent) btnImportGradesStudent.addEventListener('click', importGrades);
        if (btnSaveGradesStudent) btnSaveGradesStudent.addEventListener('click', saveGrades);
        if (btnExportGradesJSONStudent) btnExportGradesJSONStudent.addEventListener('click', () => showExportGradesModal('json'));
        if (btnExportGradesExcelStudent) btnExportGradesExcelStudent.addEventListener('click', () => showExportGradesModal('csv'));
        
        // Not işlemleri butonları
        if (btnImportGrades) btnImportGrades.addEventListener('click', importGrades);
        if (btnSaveGrades) {
            btnSaveGrades.addEventListener('click', saveGrades);
            btnSaveGrades.addEventListener('click', saveGradesToFile);
        }
        
        // JSON işlemleri butonları
        if (btnImport) btnImport.addEventListener('click', () => openModal(importModal));
        if (closeImportModal) closeImportModal.addEventListener('click', () => closeModal(importModal));
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                try {
                    // JSON verisi oluştur
                    const exportData = createExportData();
                    if (exportJsonContent) {
                        exportJsonContent.value = JSON.stringify(exportData, null, 2);
                    }
                    openModal(exportModal);
                } catch (error) {
                    console.error("JSON dışa aktarma hatası:", error);
                    showModernToast("JSON dışa aktarma işlemi başarısız oldu!", "error");
                }
            });
        }
        
        // Modal kapatma butonları
        if (closeExportModal) closeExportModal.addEventListener('click', () => closeModal(exportModal));
        if (closeImportStudentsModal) closeImportStudentsModal.addEventListener('click', () => closeModal(importStudentsModal));
        if (closeExportGradesModal) closeExportGradesModal.addEventListener('click', () => closeModal(exportGradesModal));
        if (closeTestDetailsModal) closeTestDetailsModal.addEventListener('click', () => closeModal(testDetailsModal));
        if (closeMultipleItemsModal) closeMultipleItemsModal.addEventListener('click', () => closeModal(multipleItemsModal));
        
        // Dosya işlemleri butonları
        if (btnSelectFile) btnSelectFile.addEventListener('click', () => fileInput && fileInput.click());
        if (btnApplyJson) btnApplyJson.addEventListener('click', applyJsonData);
        if (fileInput) fileInput.addEventListener('change', loadJsonFromFile);
        if (btnCopyJson) btnCopyJson.addEventListener('click', copyJsonToClipboard);
        if (btnSaveJson) btnSaveJson.addEventListener('click', saveJsonToFile);
        
        // Öğrenci işlemleri butonları
        if (btnImportStudents) btnImportStudents.addEventListener('click', () => openModal(importStudentsModal));
        if (btnSelectStudentFile) btnSelectStudentFile.addEventListener('click', () => studentJsonInput && studentJsonInput.click());
        if (btnApplyStudentJson) btnApplyStudentJson.addEventListener('click', applyStudentJsonData);
        if (studentJsonInput) studentJsonInput.addEventListener('change', loadStudentJsonFromFile);
        if (studentFileInput) studentFileInput.addEventListener('change', loadStudentsFromFile);
        if (btnClearStudents) btnClearStudents.addEventListener('click', clearStudents);
        
        // Not dışa aktarma butonları
        if (btnExportGradesJSON) btnExportGradesJSON.addEventListener('click', () => showExportGradesModal('json'));
        if (btnExportGradesExcel) btnExportGradesExcel.addEventListener('click', () => showExportGradesModal('csv'));
        if (btnCopyGrades) btnCopyGrades.addEventListener('click', copyGradesToClipboard);
        if (btnSaveGradesToFile) btnSaveGradesToFile.addEventListener('click', saveGradesToFile);
        if (btnCalculateGrades) btnCalculateGrades.addEventListener('click', calculateGrades);
        if (btnExportFinalGrades) btnExportFinalGrades.addEventListener('click', () => showExportGradesModal('csv'));
        
        // Test detayları butonları
        if (btnSaveTestDetails) btnSaveTestDetails.addEventListener('click', saveTestDetails);
        
        // Sekme işlemleri için event listeners
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                if (tabId) switchTab(tabId);
            });
        });
        
        // Daha detaylı tab işlemleri
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                try {
                    // Aktif sekme sınıfını kaldır
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    
                    // Aktif içerik sınıfını kaldır
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    
                    // Seçilen sekmeyi aktif yap
                    tab.classList.add('active');
                    
                    // İlgili içeriği göster
                    const tabId = tab.getAttribute('data-tab');
                    if (tabId) {
                        const contentElement = document.getElementById(`${tabId}Tab`);
                        if (contentElement) contentElement.classList.add('active');
                    }
                } catch (error) {
                    console.error("Tab işlemi hatası:", error);
                }
            });
        });
        
        // Etkinlik ekleme butonları
        if (btnAddTerm) btnAddTerm.addEventListener('click', addTermActivity);
        if (btnAddFinal) btnAddFinal.addEventListener('click', addFinalActivity);
        
        // Soru ve Rubrik ekleme butonları
        if (btnAddQuestion) btnAddQuestion.addEventListener('click', function() {
            if (!APP_STATE.selectedNode) {
                showModernToast("Lütfen önce bir etkinlik seçin.", "warning");
                return;
            }
            
            // Seçili düğüm kök değilse alt düğüm eklenmemeli
            if (APP_STATE.selectedNode.id.includes('.')) {
                showModernToast("Sorular sadece ana etkinliklere eklenebilir.", "warning");
                return;
            }
            
            // Çoklu soru eklemek için modal göster
            showMultipleItemsModal('soru');
        });
        
        if (btnAddRubric) btnAddRubric.addEventListener('click', function() {
            if (!APP_STATE.selectedNode) {
                showModernToast("Lütfen önce bir etkinlik seçin.", "warning");
                return;
            }
            
            // Seçili düğüm kök değilse alt düğüm eklenmemeli
            if (APP_STATE.selectedNode.id.includes('.')) {
                showModernToast("Rubrikler sadece ana etkinliklere eklenebilir.", "warning");
                return;
            }
            
            // Çoklu rubrik eklemek için modal göster
            showMultipleItemsModal('rubrik');
        });
        
        // Diğer ağaç işlem butonları
        if (btnRemove) btnRemove.addEventListener('click', removeNode);
        if (btnExpandAll) btnExpandAll.addEventListener('click', expandAll);
        if (btnCollapseAll) btnCollapseAll.addEventListener('click', collapseAll);
        
        // Rubrik ve soru türleri için click event
        document.querySelectorAll('.rubric-item').forEach(item => {
            item.addEventListener('click', function() {
                try {
                    if (!APP_STATE.selectedNode) {
                        showModernToast("Lütfen önce bir etkinlik seçin.", "warning");
                        return;
                    }
                    
                    // Seçili düğüm kök değilse alt düğüm eklenmemeli
                    if (APP_STATE.selectedNode.id.includes('.')) {
                        showModernToast("Rubrikler sadece ana etkinliklere eklenebilir.", "warning");
                        return;
                    }
                    
                    const rubricType = this.getAttribute('data-type');
                    const description = this.getAttribute('data-description');
                    addRubricToNode(APP_STATE.selectedNode, rubricType, description);
                } catch (error) {
                    console.error("Rubrik ekleme hatası:", error);
                    showModernToast("Rubrik eklenirken bir hata oluştu!", "error");
                }
            });
        });
        
        document.querySelectorAll('.question-type-item').forEach(item => {
            item.addEventListener('click', function() {
                try {
                    if (!APP_STATE.selectedNode) {
                        showModernToast("Lütfen önce bir etkinlik seçin.", "warning");
                        return;
                    }
                    
                    // Seçili düğüm kök değilse alt düğüm eklenmemeli
                    if (APP_STATE.selectedNode.id.includes('.')) {
                        showModernToast("Sorular sadece ana etkinliklere eklenebilir.", "warning");
                        return;
                    }
                    
                    const questionType = this.getAttribute('data-type');
                    
                    // Test türü için özel işlem
                    if (questionType === 'Test') {
                        addTestToNode(APP_STATE.selectedNode);
                        return;
                    }
                    
                    const description = this.getAttribute('data-description');
                    addQuestionToNode(APP_STATE.selectedNode, questionType, description);
                } catch (error) {
                    console.error("Soru ekleme hatası:", error);
                    showModernToast("Soru eklenirken bir hata oluştu!", "error");
                }
            });
        });
        
        // Öğrenme çıktıları için tıklama işlemleri
        document.querySelectorAll('.outcome-item').forEach(item => {
            item.addEventListener('click', function() {
                try {
                    if (APP_STATE.selectedNode) {
                        const outcomeId = this.getAttribute('data-id');
                        if (!outcomeId) return;
                        
                        const outcomesInput = document.querySelector(`.tree-node[data-id="${APP_STATE.selectedNode.id}"] .nodeOutcomes`);
                        if (outcomesInput) {
                            const currentValue = outcomesInput.value.trim();
                            
                            // Alt düğüm ise (soru veya rubrik), sadece bir ÖÇ atanabilsin
                            const isSubItem = APP_STATE.selectedNode.id.includes('.');
                            
                            if (isSubItem) {
                                outcomesInput.value = outcomeId;
                            } else {
                                // Değer boşsa veya virgülle bitiyorsa
                                if (!currentValue) {
                                    outcomesInput.value = outcomeId;
                                } else if (currentValue.endsWith(',')) {
                                    outcomesInput.value = currentValue + ' ' + outcomeId;
                                } else {
                                    outcomesInput.value = currentValue + ', ' + outcomeId;
                                }
                            }
                            
                            // Değeri değişmiş gibi tetikle
                            outcomesInput.dispatchEvent(new Event('change'));
                            
                            showModernToast(`"${outcomeId}" öğrenme çıktısı eklendi.`);
                        }
                    } else {
                        showModernToast("Lütfen önce bir etkinlik seçin.", "warning");
                    }
                } catch (error) {
                    console.error("Öğrenme çıktısı ekleme hatası:", error);
                    showModernToast("Öğrenme çıktısı eklenirken bir hata oluştu!", "error");
                }
            });
        });
        
        // Tüm close-modal sınıfına sahip butonlara tıklama olayı ekle
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', function() {
                try {
                    // En yakın modal elementini bul
                    const modal = this.closest('.modal');
                    if (modal) {
                        closeModal(modal);
                    }
                } catch (error) {
                    console.error("Modal kapatma hatası:", error);
                }
            });
        });
        
        // İtem tipi değişikliğini dinle (çoklu öğe ekleme modalında)
        if (itemType) {
            itemType.addEventListener('change', function() {
                try {
                    const type = this.value;
                    if (questionTypeContainer && rubricTypeContainer) {
                        if (type === 'soru') {
                            questionTypeContainer.style.display = 'block';
                            rubricTypeContainer.style.display = 'none';
                        } else {
                            questionTypeContainer.style.display = 'none';
                            rubricTypeContainer.style.display = 'block';
                        }
                    }
                } catch (error) {
                    console.error("Tip değişikliği hatası:", error);
                }
            });
        }
        
        // Çoklu öğe ekleme butonunu dinle
        if (btnAddMultipleItems) {
            btnAddMultipleItems.addEventListener('click', addMultipleItems);
        }
        
        // İlk açılışta aktif sekmeyi ayarla
        switchTab(APP_STATE.currentActiveTabId || 'definition');

		// Puan dağıtma butonu
		const btnDistributePoints = document.getElementById('btnDistributePoints');
		if (btnDistributePoints) {
			btnDistributePoints.addEventListener('click', function() {
				if (!APP_STATE.selectedNode) {
					showModernToast("Lütfen önce bir etkinlik seçin.", "warning");
					return;
				}
				
				// Eğer alt düğüm seçiliyse üst düğümü bul
				let parentNode = APP_STATE.selectedNode;
				if (parentNode.id.includes('.')) {
					const parentId = parentNode.id.substring(0, parentNode.id.lastIndexOf('.'));
					parentNode = findNodeById(parentId);
				}
				
				// Puanları dağıt
				if (parentNode && parentNode.children && parentNode.children.length > 0) {
					// Alt öğelerin toplam ağırlığını hesapla
					const totalWeight = parentNode.children.reduce((sum, child) => sum + (parseInt(child.weight) || 0), 0);
					
					// Dağıtım modalını göster
					showDistributePointsModal(parentNode, totalWeight);
				} else {
					showModernToast("Seçilen etkinliğin alt öğeleri bulunmuyor.", "warning");
				}
			});
		}
		
		
		// Test dağılım butonu
		const btnDistributeTestScores = document.getElementById('btnDistributeTestScores');
		if (btnDistributeTestScores) {
			btnDistributeTestScores.addEventListener('click', function() {
				if (!APP_STATE.testDetailsNode) {
					showModernToast("Test detayları bulunamadı.", "error");
					return;
				}
				
				// Test detaylarını al
				const testId = APP_STATE.testDetailsNode.id;
				const totalQuestions = parseInt(totalQuestionsInput.value) || 20;
				
				// Öğrenci verileri var mı kontrol et
				if (!APP_STATE.studentData || APP_STATE.studentData.length === 0) {
					showModernToast("Öğrenci verisi bulunamadı.", "warning");
					return;
				}
				
				// İşlemi onaylamak için modern onay modalı göster
				showDeleteConfirmModal(
					// Onay verildiğinde çalışacak fonksiyon
					function() {
						// Her öğrenci için rastgele doğru/yanlış sayısı belirle ve dağılım yap
						APP_STATE.studentData.forEach(student => {
							const studentId = student.studentId;
							
							// Rastgele doğru sayısı üret
							const correct = Math.floor(Math.random() * (totalQuestions + 1));
							
							// Rastgele yanlış sayısı üret (toplam soruyu geçmeyecek şekilde)
							const maxWrong = totalQuestions - correct;
							const wrong = Math.floor(Math.random() * (maxWrong + 1));
							
							// Not verilerini kaydeden yardımcı fonksiyon kullan
							// (saveTestDistribution fonksiyonunu kullan, modal göstermeyen)
							saveTestDistribution(studentId, testId, correct, wrong);
						});
						
						// Değerlendirme görünümünü güncelle
						updateAssessmentView();
						
						showModernToast("Tüm öğrenciler için rastgele test puanları oluşturuldu ve dağıtıldı.", "success");
					},
					// Onay mesajı
					"Tüm öğrenciler için rastgele test puanları oluşturmak istediğinizden emin misiniz?"
				);
			});
		}
				
        
        console.log("Tüm olay dinleyicileri başarıyla yüklendi.");
    } catch (error) {
        console.error("Olay dinleyicileri yüklenirken hata oluştu:", error);
        alert("Uygulama başlatılırken bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.");
    }
});

/**
 * Alan adlarını normalleştirme (İngilizce/Türkçe uyumu)
 */
function normalizeGradeFields() {
    try {
        if (!APP_STATE.gradesData) return;
        
        // Tüm öğrenciler için
        Object.keys(APP_STATE.gradesData).forEach(studentId => {
            const studentGrades = APP_STATE.gradesData[studentId];
            
            // Hesaplanmış notlar için standart alanları ekle/normalleştir
            if (studentGrades.yariyilIciNotu !== undefined || studentGrades.termGrade !== undefined) {
                const termGrade = studentGrades.yariyilIciNotu || studentGrades.termGrade || 0;
                studentGrades.yariyilIciNotu = parseFloat(termGrade);
                studentGrades.termGrade = parseFloat(termGrade);
            }
            
            if (studentGrades.yariyilSonuNotu !== undefined || studentGrades.finalGrade !== undefined) {
                const finalGrade = studentGrades.yariyilSonuNotu || studentGrades.finalGrade || 0;
                studentGrades.yariyilSonuNotu = parseFloat(finalGrade);
                studentGrades.finalGrade = parseFloat(finalGrade);
            }
            
            if (studentGrades.basariNotu !== undefined || studentGrades.totalGrade !== undefined) {
                const totalGrade = studentGrades.basariNotu || studentGrades.totalGrade || 0;
                studentGrades.basariNotu = parseFloat(totalGrade);
                studentGrades.totalGrade = parseFloat(totalGrade);
            }
            
            if (studentGrades.harfNotu !== undefined || studentGrades.letterGrade !== undefined) {
                const letterGrade = studentGrades.harfNotu || studentGrades.letterGrade || 'FF';
                studentGrades.harfNotu = letterGrade;
                studentGrades.letterGrade = letterGrade;
            }
            
            // Tüm aktiviteler için
            Object.keys(studentGrades).forEach(activityId => {
                const grade = studentGrades[activityId];
                
                // Nesne ise ve test skorlarını içeriyorsa
                if (typeof grade === 'object' && grade !== null) {
                    // Type/tip alanlarını kontrol et
                    if (grade.type === 'test' || grade.tip === 'test') {
                        // Her iki dilde de alanları ayarla
                        grade.type = 'test';
                        grade.tip = 'test';
                        
                        // Doğru sayısı için
                        if (grade.correct !== undefined || grade.dogru !== undefined) {
                            const correctValue = grade.correct !== undefined ? grade.correct : grade.dogru;
                            grade.correct = correctValue;
                            grade.dogru = correctValue;
                        }
                        
                        // Yanlış sayısı için
                        if (grade.wrong !== undefined || grade.yanlis !== undefined) {
                            const wrongValue = grade.wrong !== undefined ? grade.wrong : grade.yanlis;
                            grade.wrong = wrongValue;
                            grade.yanlis = wrongValue;
                        }
                    }
                    
                    // Alt nesneleri kontrol et (iç içe yapı için)
                    Object.keys(grade).forEach(subKey => {
                        const subGrade = grade[subKey];
                        if (typeof subGrade === 'object' && subGrade !== null) {
                            if (subGrade.type === 'test' || subGrade.tip === 'test') {
                                // Her iki dilde de alanları ayarla
                                subGrade.type = 'test';
                                subGrade.tip = 'test';
                                
                                // Doğru sayısı için
                                if (subGrade.correct !== undefined || subGrade.dogru !== undefined) {
                                    const correctValue = subGrade.correct !== undefined ? subGrade.correct : subGrade.dogru;
                                    subGrade.correct = correctValue;
                                    subGrade.dogru = correctValue;
                                }
                                
                                // Yanlış sayısı için
                                if (subGrade.wrong !== undefined || subGrade.yanlis !== undefined) {
                                    const wrongValue = subGrade.wrong !== undefined ? subGrade.wrong : subGrade.yanlis;
                                    subGrade.wrong = wrongValue;
                                    subGrade.yanlis = wrongValue;
                                }
                            }
                        }
                    });
                }
            });
        });
    } catch (error) {
        console.error("Not alanları normalleştirilirken hata oluştu:", error);
    }
}

/**
 * Hesaplanmış notları güncelleme
 */
function updateCalculatedGrades() {
    try {
        if (!APP_STATE.studentData || APP_STATE.studentData.length === 0) {
            return;
        }
        
        APP_STATE.studentData.forEach(student => {
            const studentId = student.studentId;
            
            // Yarıyıl içi etkinlikler
            const termActivities = APP_STATE.assessmentTree.filter(node => node.id.startsWith('A'));
            let termGrade = 0;
            
            // İç ağırlık toplamı
            const termInternalTotal = termActivities.reduce((sum, node) => sum + parseFloat(node.weight || 0), 0);
            
            if (termInternalTotal > 0) {
                termActivities.forEach(activity => {
                    // İç ağırlık normalleştirmesi
                    const activityWeight = activity.weight / termInternalTotal; 
                    let activityGrade = 0;
                    
                    if (activity.children && activity.children.length > 0) {
                        // Alt etkinlikler
                        const childrenTotalWeight = activity.children.reduce((sum, child) => sum + parseFloat(child.weight || 0), 0);
                        
                        if (childrenTotalWeight > 0) {
                            activity.children.forEach(subItem => {
                                // Alt öğe ağırlık normalleştirmesi
                                const subItemWeight = subItem.weight / childrenTotalWeight; 
                                const grade = getStudentGrade(studentId, subItem.id) || 0;
                                const scaledGrade = (grade / (subItem.points || 1)) * 100; // 100 üzerinden
                                activityGrade += scaledGrade * subItemWeight;
                            });
                        }
                    } else {
                        // Basit etkinlik
                        const grade = getStudentGrade(studentId, activity.id) || 0;
                        activityGrade = (grade / (activity.points || 1)) * 100; // 100 üzerinden
                    }
                    
                    termGrade += activityGrade * activityWeight;
                });
            }
            
            // Yarıyıl sonu etkinlikler
            const finalActivities = APP_STATE.assessmentTree.filter(node => node.id.startsWith('F'));
            let finalGrade = 0;
            
            // İç ağırlık toplamı
            const finalInternalTotal = finalActivities.reduce((sum, node) => sum + parseFloat(node.weight || 0), 0);
            
            if (finalInternalTotal > 0) {
                finalActivities.forEach(activity => {
                    // İç ağırlık normalleştirmesi
                    const activityWeight = activity.weight / finalInternalTotal;
                    let activityGrade = 0;
                    
                    if (activity.children && activity.children.length > 0) {
                        // Alt etkinlikler
                        const childrenTotalWeight = activity.children.reduce((sum, child) => sum + parseFloat(child.weight || 0), 0);
                        
                        if (childrenTotalWeight > 0) {
                            activity.children.forEach(subItem => {
                                // Alt öğe ağırlık normalleştirmesi
                                const subItemWeight = subItem.weight / childrenTotalWeight;
                                const grade = getStudentGrade(studentId, subItem.id) || 0;
                                const scaledGrade = (grade / (subItem.points || 1)) * 100; // 100 üzerinden
                                activityGrade += scaledGrade * subItemWeight;
                            });
                        }
                    } else {
                        // Basit etkinlik
                        const grade = getStudentGrade(studentId, activity.id) || 0;
                        activityGrade = (grade / (activity.points || 1)) * 100; // 100 üzerinden
                    }
                    
                    finalGrade += activityGrade * activityWeight;
                });
            }
            
            // Toplam ve harf notu
            const totalGrade = (termGrade * APP_STATE.termWeight / 100) + (finalGrade * APP_STATE.finalWeight / 100);
            const letterGrade = getLetterGrade(totalGrade);
            
            // Öğrenci notları nesnesini oluştur
            if (!APP_STATE.gradesData[studentId]) {
                APP_STATE.gradesData[studentId] = {};
            }
            
            // Yarıyıl içi, sonu ve toplam not bilgilerini ekle
            APP_STATE.gradesData[studentId].yariyilIciNotu = parseFloat(termGrade.toFixed(2));
            APP_STATE.gradesData[studentId].yariyilSonuNotu = parseFloat(finalGrade.toFixed(2));
            APP_STATE.gradesData[studentId].basariNotu = parseFloat(totalGrade.toFixed(2));
            APP_STATE.gradesData[studentId].harfNotu = letterGrade;
        });
    } catch (error) {
        console.error("Notlar hesaplanırken hata oluştu:", error);
    }
}

/**
 * Öğrenci seçicisini güncelleme
 */
function updateStudentSelector() {
    try {
        const studentSelector = document.getElementById('studentSelector');
        if (!studentSelector) return;
        
        // Mevcut seçenekleri temizle
        studentSelector.innerHTML = '<option value="">Öğrenci seçiniz...</option>';
        
        // Öğrencileri ekle
        if (APP_STATE.studentData && APP_STATE.studentData.length > 0) {
            APP_STATE.studentData.forEach(student => {
                const option = document.createElement('option');
                option.value = student.studentId;
                option.textContent = `${student.studentId} - ${student.name} ${student.surname}`;
                
                // İlişiği kesilmiş öğrencileri gri yap
                if (student.status === 'İlişiği Kesilmiş') {
                    option.style.color = 'var(--text-light)';
                }
                
                studentSelector.appendChild(option);
            });
        }
        
        // Öğrenci seçildiğinde notları göster
        studentSelector.addEventListener('change', function() {
            const selectedStudentId = this.value;
            if (selectedStudentId) {
                showStudentGrades(selectedStudentId);
            } else {
                // Öğrenci seçilmediyse boş mesaj göster
                document.getElementById('studentGradesContainer').innerHTML = 
                    '<p class="empty-message">Öğrenci seçilmedi. Lütfen yukarıdan bir öğrenci seçin.</p>';
            }
        });
    } catch (error) {
        console.error("Öğrenci seçicisi güncellenirken hata oluştu:", error);
        showModernToast("Öğrenci seçicisi güncellenemedi!", "error");
    }
}

/**
 * Seçilen öğrencinin notlarını gösterme
 * @param {string} studentId - Öğrenci ID'si
 */
function showStudentGrades(studentId) {
    try {
        const container = document.getElementById('studentGradesContainer');
        if (!container) return;
        
        // Öğrenci bilgilerini bul
        const student = APP_STATE.studentData.find(s => s.studentId === studentId);
        if (!student) {
            container.innerHTML = '<p class="empty-message">Öğrenci bulunamadı.</p>';
            return;
        }
        
        // Öğrenci başlık bilgisi
        let html = `
            <div class="student-info">
                <h4>${student.name} ${student.surname} (${student.studentId})</h4>
                <p>${student.status || 'Aktif'}</p>
            </div>
        `;
        
        // Notlar bölümü
        html += '<div class="student-grades-sections">';
        
        // Yarıyıl içi etkinlikleri
        const termActivities = APP_STATE.assessmentTree.filter(node => node.id.startsWith('A'));
        if (termActivities.length > 0) {
            html += `
                <div class="assessment-subsection">
                    <h4>Yarıyıl İçi Etkinlikler (${APP_STATE.termWeight}%)</h4>
            `;
            
            // Her bir yarıyıl içi etkinlik için
            termActivities.forEach(activity => {
                html += createStudentActivitySection(student, activity);
            });
            
            html += '</div>';
        }
        
        // Yarıyıl sonu etkinlikleri
        const finalActivities = APP_STATE.assessmentTree.filter(node => node.id.startsWith('F'));
        if (finalActivities.length > 0) {
            html += `
                <div class="assessment-subsection">
                    <h4>Yarıyıl Sonu Etkinlikler (${APP_STATE.finalWeight}%)</h4>
            `;
            
            // Her bir yarıyıl sonu etkinlik için
            finalActivities.forEach(activity => {
                html += createStudentActivitySection(student, activity);
            });
            
            html += '</div>';
        }
        
        // Özet bilgisi
        if (APP_STATE.gradesData[studentId]) {
            const termGrade = APP_STATE.gradesData[studentId].yariyilIciNotu || 0;
            const finalGrade = APP_STATE.gradesData[studentId].yariyilSonuNotu || 0;
            const totalGrade = APP_STATE.gradesData[studentId].basariNotu || 0;
            const letterGrade = APP_STATE.gradesData[studentId].harfNotu || 'FF';
            
            html += `
                <div class="student-summary">
                    <h4>Not Özeti</h4>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span>Yarıyıl İçi:</span>
                            <strong>${termGrade.toFixed(2)}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Yarıyıl Sonu:</span>
                            <strong>${finalGrade.toFixed(2)}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Toplam:</span>
                            <strong>${totalGrade.toFixed(2)}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Harf Notu:</span>
                            <strong>${letterGrade}</strong>
                        </div>
                    </div>
                </div>
            `;
        }
        
        html += '</div>'; // student-grades-sections kapanışı
        
        container.innerHTML = html;
        
        // Not girişi input elemanlarına event listener ekle
        container.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('change', function() {
                updateStudentGradeFromStudentView(this);
            });
        });
        
    } catch (error) {
        console.error("Öğrenci notları gösterilirken hata oluştu:", error);
        showModernToast("Öğrenci notları gösterilemedi!", "error");
    }
}

/**
 * Öğrenci görünümünde etkinlik bölümü oluşturma
 * @param {Object} student - Öğrenci
 * @param {Object} activity - Etkinlik
 * @returns {string} - HTML içeriği
 */
function createStudentActivitySection(student, activity) {
    try {
        let html = `
            <div class="student-activity" data-activity-id="${activity.id}">
                <h5>${activity.name} <span class="badge badge-primary">${activity.weight}%</span></h5>
        `;
        
        // Aktivitenin alt öğeleri var mı kontrol et
        if (activity.children && activity.children.length > 0) {
            // Alt öğeler var, her biri için giriş alanı oluştur
            html += '<div class="student-subitems">';
            
            activity.children.forEach(subItem => {
                if (subItem.type === 'Test') {
                    html += createStudentTestInputSection(student, subItem);
                } else {
                    html += createStudentSubItemInputSection(student, subItem);
                }
            });
            
            html += '</div>';
        } else {
            // Alt öğe yoksa basit bir puan girişi göster
            const grade = getStudentGrade(student.studentId, activity.id) || '';
            
            html += `
                <div class="student-grade-input">
                    <label>Puan:</label>
                    <input type="number" min="0" max="${activity.points}" 
                        data-student-id="${student.studentId}" 
                        data-activity-id="${activity.id}" 
                        value="${grade}"
                        onchange="updateStudentGradeFromStudentView(this)">
                    <span>/ ${activity.points}</span>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    } catch (error) {
        console.error("Öğrenci etkinlik bölümü oluşturulurken hata oluştu:", error);
        return '<div class="error-message">Etkinlik bilgileri yüklenemedi.</div>';
    }
}

/**
 * Öğrenci görünümünde alt öğe giriş bölümü oluşturma (Soru/Rubrik)
 * @param {Object} student - Öğrenci
 * @param {Object} subItem - Alt öğe
 * @returns {string} - HTML içeriği
 */
function createStudentSubItemInputSection(student, subItem) {
    try {
        const grade = getStudentGrade(student.studentId, subItem.id) || '';
        
        return `
            <div class="student-subitem" data-subitem-id="${subItem.id}">
                <div class="subitem-header">
                    <span>${subItem.name}</span>
                    <span class="badge badge-primary">${subItem.points} puan</span>
                    <span class="badge badge-success">${subItem.outcomes.join(', ')}</span>
                </div>
                <div class="student-grade-input">
                    <input type="number" min="0" max="${subItem.points}" 
                        data-student-id="${student.studentId}" 
                        data-activity-id="${subItem.id}" 
                        value="${grade}"
                        onchange="updateStudentGradeFromStudentView(this)">
                    <span>/ ${subItem.points}</span>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Alt öğe giriş bölümü oluşturulurken hata oluştu:", error);
        return '<div class="error-message">Alt öğe bilgileri yüklenemedi.</div>';
    }
}

/**
 * Öğrenci görünümünde test giriş bölümü oluşturma
 * @param {Object} student - Öğrenci
 * @param {Object} testItem - Test öğesi
 * @returns {string} - HTML içeriği
 */
function createStudentTestInputSection(student, testItem) {
    try {
        // Test sonuçlarını al
        const testScore = getStudentTestScore(student.studentId, testItem.id);
        const correct = testScore?.correct || 0;
        const wrong = testScore?.wrong || 0;
        const totalScore = correct * testItem.testDetails.correctWeight - wrong * Math.abs(testItem.testDetails.wrongPenalty);
        
        return `
            <div class="student-subitem student-test-item" data-subitem-id="${testItem.id}">
                <div class="subitem-header">
                    <span>${testItem.name}</span>
                    <span class="badge badge-primary">${testItem.points} puan</span>
                    <span class="badge badge-success">${testItem.outcomes.join(', ')}</span>
                </div>
                <div class="test-info">
                    <p>Toplam ${testItem.testDetails.totalQuestions} soru, her doğru: ${testItem.testDetails.correctWeight} puan, her yanlış: ${testItem.testDetails.wrongPenalty} puan</p>
                </div>
                <div class="test-inputs">
                    <div class="student-grade-input">
                        <label>Doğru:</label>
                        <input type="number" min="0" max="${testItem.testDetails.totalQuestions}" 
                            data-student-id="${student.studentId}" 
                            data-test-id="${testItem.id}" 
                            data-field="correct"
                            value="${correct}"
                            onchange="updateTestScoreFromStudentView(this)">
                    </div>
                    <div class="student-grade-input">
                        <label>Yanlış:</label>
                        <input type="number" min="0" max="${testItem.testDetails.totalQuestions}" 
                            data-student-id="${student.studentId}" 
                            data-test-id="${testItem.id}" 
                            data-field="wrong"
                            value="${wrong}"
                            onchange="updateTestScoreFromStudentView(this)">
                    </div>
                    <div class="student-grade-input">
                        <label>Toplam:</label>
                        <span class="total-test-score">${totalScore.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Test giriş bölümü oluşturulurken hata oluştu:", error);
        return '<div class="error-message">Test bilgileri yüklenemedi.</div>';
    }
}

/**
 * Öğrenci görünümünden not güncelleme
 * @param {HTMLInputElement} input - Not input elementi
 */
function updateStudentGradeFromStudentView(input) {
    try {
        const studentId = input.dataset.studentId;
        const activityId = input.dataset.activityId;
        
        // Aktiviteyi bul ve maksimum puanını kontrol et
        const activity = findNodeById(activityId);
        if (!activity) {
            console.error(`Aktivite bulunamadı: ${activityId}`);
            return;
        }
        
        // Maksimum puan kontrolü
        const maxPoints = activity.points || 100;
        let value = parseFloat(input.value) || 0;
        
        // Maksimum puanı aşan değerleri sınırla
        if (value > maxPoints) {
            value = maxPoints;
            input.value = maxPoints;
            showModernToast(`Dikkat: Puan ${maxPoints} değerinden büyük olamaz!`, "warning");
        }
        
        // Öğrenci verisi oluştur
        if (!APP_STATE.gradesData[studentId]) {
            APP_STATE.gradesData[studentId] = {};
        }
        
        // Test mi kontrol et
        if (activity && activity.type === 'Test') {
            // Test skorları için özel işlem
            const correctWeight = activity.testDetails?.correctWeight || 5;
            const wrongPenalty = Math.abs(activity.testDetails?.wrongPenalty || 0);
            
            // Basit yaklaşım: tüm puanı doğru sorudan gelecek şekilde ayarla
            const correctEstimate = Math.round(value / correctWeight);
            
            APP_STATE.gradesData[studentId][activityId] = {
                tip: 'test',
                dogru: correctEstimate,
                yanlis: 0
            };
            
            // Değerlendirme sekmesindeki form elementlerini bul ve güncelle
            const assessmentCorrectInput = document.querySelector(`#assessment-content input[data-student-id="${studentId}"][data-test-id="${activityId}"][data-field="correct"]`);
            const assessmentWrongInput = document.querySelector(`#assessment-content input[data-student-id="${studentId}"][data-test-id="${activityId}"][data-field="wrong"]`);
            
            if (assessmentCorrectInput) assessmentCorrectInput.value = correctEstimate;
            if (assessmentWrongInput) assessmentWrongInput.value = 0;
            
            // Total score'u güncelle
            const assessmentTotalScore = document.querySelector(`#assessment-content tr:has(input[data-student-id="${studentId}"][data-test-id="${activityId}"]) .total-score`);
            if (assessmentTotalScore) {
                assessmentTotalScore.textContent = value.toFixed(1);
            }
            
        } else {
            // Normal not için
            APP_STATE.gradesData[studentId][activityId] = value;
            
            // Alt düğüm yapısını oluştur (A1.1 -> A1 altında storlama)
            const parts = activityId.split('.');
            if (parts.length > 1) {
                const parentId = parts[0]; // A1
                const shortId = parts[parts.length - 1]; // 1
                
                // Eğer üst aktivite yoksa oluştur
                if (!APP_STATE.gradesData[studentId][parentId]) {
                    APP_STATE.gradesData[studentId][parentId] = {
                        toplam: 0
                    };
                }
                
                // Not değerini ekle - hem tam ID, hem kısa ID olarak
                APP_STATE.gradesData[studentId][parentId][activityId] = value;
                APP_STATE.gradesData[studentId][parentId][shortId] = value;
                
                // Toplama hesapla
                updateParentActivityTotal(studentId, parentId);
            }
            
            // Değerlendirme sekmesindeki aynı inputu güncelle
            const assessmentInput = document.querySelector(`#assessment-content input[data-student-id="${studentId}"][data-activity-id="${activityId}"]`);
            if (assessmentInput && assessmentInput !== input) {
                assessmentInput.value = value;
            }
        }
        
        // Notları yeniden hesapla
        updateStudentCalculatedGrade(studentId);
        
        // Özetleme bölümünü güncelle
        updateStudentSummary(studentId);
        
    } catch (error) {
        console.error("Öğrenci notu güncellenirken hata oluştu:", error);
        showModernToast("Not güncellenirken hata oluştu!", "error");
    }
}

/**
 * Öğrenci görünümünde test skorunu güncelleme
 * @param {HTMLInputElement} input - Test skoru input elementi
 */
function updateTestScoreFromStudentView(input) {
    try {
        const studentId = input.dataset.studentId;
        const testId = input.dataset.testId;
        const field = input.dataset.field;
        const value = parseInt(input.value) || 0;
        
        // Önce verileri güncelle
        updateTestScoreData(studentId, testId, field, value);
        
        // Değerlendirme sekmesindeki karşılık gelen test score alanlarını güncelle
        const assessmentInput = document.querySelector(`#assessment-content input[data-student-id="${studentId}"][data-test-id="${testId}"][data-field="${field}"]`);
        if (assessmentInput && assessmentInput !== input) {
            assessmentInput.value = value;
            // Event'i manuel tetikle
            assessmentInput.dispatchEvent(new Event('change'));
        }
        
        // Yalnızca öğrenci görünümündeki toplam skoru güncelle
        updateStudentViewTestTotal(studentId, testId);
        
        // Notları yeniden hesapla
        updateStudentCalculatedGrade(studentId);
        
        // Özetleme bölümünü güncelle
        updateStudentSummary(studentId);
        
    } catch (error) {
        console.error("Test skoru güncellenirken hata oluştu:", error);
        showModernToast("Test skoru güncellenirken hata oluştu!", "error");
    }
}

// Test skoru verilerini güncelleme (yardımcı fonksiyon)
function updateTestScoreData(studentId, testId, field, value) {
    // Test düğümünü bul
    const testNode = findNodeById(testId);
    if (!testNode) return;
    
    // Öğrenci notları henüz yoksa oluştur
    if (!APP_STATE.gradesData[studentId]) {
        APP_STATE.gradesData[studentId] = {};
    }
    
    // Test notları henüz yoksa oluştur
    if (!APP_STATE.gradesData[studentId][testId]) {
        APP_STATE.gradesData[studentId][testId] = {
            tip: 'test',
            dogru: 0,
            yanlis: 0
        };
    }
    
    // İlgili alanı güncelle
    if (field === 'correct') {
        APP_STATE.gradesData[studentId][testId].dogru = value;
    } else if (field === 'wrong') {
        APP_STATE.gradesData[studentId][testId].yanlis = value;
    } else {
        APP_STATE.gradesData[studentId][testId][field] = value;
    }
    
    // Doğru ve yanlış sayılarını kontrol et
    const testScore = APP_STATE.gradesData[studentId][testId];
    const correct = testScore.dogru || 0;
    const wrong = testScore.yanlis || 0;
    const totalQuestions = testNode.testDetails.totalQuestions;
    
    // Doğru ve yanlış toplamı toplam soru sayısını geçemez
    if (correct + wrong > totalQuestions) {
        showModernToast(`Dikkat: Doğru ve yanlış soruların toplamı toplam soru sayısını (${totalQuestions}) geçemez.`, "warning");
        // Değeri düzelt
        if (field === 'correct') {
            APP_STATE.gradesData[studentId][testId].dogru = totalQuestions - wrong;
        } else {
            APP_STATE.gradesData[studentId][testId].yanlis = totalQuestions - correct;
        }
    }
    
    // Alt test yapısı oluştur (gerekiyorsa)
    const parts = testId.split('.');
    if (parts.length > 1) {
        const parentId = parts[0]; // A1
        const shortId = parts[parts.length - 1]; // 1
        
        // Eğer üst aktivite yoksa oluştur
        if (!APP_STATE.gradesData[studentId][parentId]) {
            APP_STATE.gradesData[studentId][parentId] = {
                toplam: 0
            };
        }
        
        // Kısa kod da ekle
        APP_STATE.gradesData[studentId][parentId][shortId] = {
            tip: 'test',
            dogru: testScore.dogru,
            yanlis: testScore.yanlis
        };
        
        // Alt yapıya da ekle
        if (!APP_STATE.gradesData[studentId][parentId][testId]) {
            APP_STATE.gradesData[studentId][parentId][testId] = {
                tip: 'test',
                dogru: testScore.dogru,
                yanlis: testScore.yanlis
            };
        } else {
            APP_STATE.gradesData[studentId][parentId][testId].dogru = testScore.dogru;
            APP_STATE.gradesData[studentId][parentId][testId].yanlis = testScore.yanlis;
        }
        
        // Toplama hesapla
        updateParentActivityTotal(studentId, parentId);
    }
}

// Üst aktivitenin toplamını güncelleme (yardımcı fonksiyon)
function updateParentActivityTotal(studentId, parentId) {
    const parentActivity = findNodeById(parentId);
    if (parentActivity && parentActivity.children && parentActivity.children.length > 0) {
        let total = 0;
        let maxPoints = 0;
        
        parentActivity.children.forEach(child => {
            let grade = 0;
            if (child.type === 'Test') {
                // Test notları için özel hesaplama
                const testScore = APP_STATE.gradesData[studentId][child.id];
                if (testScore && testScore.tip === 'test') {
                    const correct = testScore.dogru || 0;
                    const wrong = testScore.yanlis || 0;
                    grade = correct * (child.testDetails?.correctWeight || 5) - 
                            wrong * Math.abs(child.testDetails?.wrongPenalty || 0);
                }
            } else {
                grade = getStudentGrade(studentId, child.id) || 0;
            }
            total += grade;
            maxPoints += parseFloat(child.points) || 0;
        });
        
        // Toplam puanı hesapla (100 üzerinden)
        const normalized = maxPoints > 0 ? (total / maxPoints) * 100 : 0;
        APP_STATE.gradesData[studentId][parentId].toplam = normalized;
    }
}

// Öğrenci görünümünde test toplamını güncelleme (yardımcı fonksiyon)
function updateStudentViewTestTotal(studentId, testId) {
    const testNode = findNodeById(testId);
    if (!testNode) return;
    
    const testScore = APP_STATE.gradesData[studentId][testId];
    if (!testScore) return;
    
    const correct = testScore.dogru || 0;
    const wrong = testScore.yanlis || 0;
    const correctWeight = testNode.testDetails?.correctWeight || 5;
    const wrongPenalty = Math.abs(testNode.testDetails?.wrongPenalty || 0);
    const totalScore = correct * correctWeight - wrong * wrongPenalty;
    
    // Öğrenci görünümündeki toplam skoru güncelle
    const studentViewTotalElement = document.querySelector(`#studentGradesContainer .student-test-item[data-subitem-id="${testId}"] .total-test-score`);
    if (studentViewTotalElement) {
        studentViewTotalElement.textContent = totalScore.toFixed(1);
    }
}

// Öğrenci özet bilgilerini güncelleme (yardımcı fonksiyon)
function updateStudentSummary(studentId) {
    if (!APP_STATE.gradesData[studentId]) return;
    
    // Özet alanını güncelle
    const summaryItems = document.querySelectorAll('#studentGradesContainer .student-summary .summary-item strong');
    if (summaryItems.length === 4) {
        summaryItems[0].textContent = (APP_STATE.gradesData[studentId].yariyilIciNotu || 0).toFixed(2);
        summaryItems[1].textContent = (APP_STATE.gradesData[studentId].yariyilSonuNotu || 0).toFixed(2);
        summaryItems[2].textContent = (APP_STATE.gradesData[studentId].basariNotu || 0).toFixed(2);
        summaryItems[3].textContent = APP_STATE.gradesData[studentId].harfNotu || 'FF';
    }
}

/**
 * Çoklu öğe ekleme modalını gösterme
 * @param {string} type - Eklenecek öğe tipi ('soru' veya 'rubrik')
 */
function showMultipleItemsModal(type = 'soru') {
    if (!APP_STATE.selectedNode) {
        showModernToast("Lütfen önce bir etkinlik seçin.", "warning");
        return;
    }
    
    // Seçili düğüm kök değilse alt düğüm eklenmemeli
    if (APP_STATE.selectedNode.id.includes('.')) {
        showModernToast(`${type === 'soru' ? 'Sorular' : 'Rubrikler'} sadece ana etkinliklere eklenebilir.`, "warning");
        return;
    }
    
    // Modal başlığını ayarla
    multipleItemsTitle.textContent = type === 'soru' ? 'Çoklu Soru Ekle' : 'Çoklu Rubrik Ekle';
    
    // Tip değişimine göre uygun container'ı göster
    if (type === 'soru') {
        questionTypeContainer.style.display = 'block';
        rubricTypeContainer.style.display = 'none';
        
        // Soru tiplerini dinamik olarak doldur
        questionType.innerHTML = '';
        
        // Önce varsayılan 'Soru' seçeneği
        const defaultOption = document.createElement('option');
        defaultOption.value = 'Soru';
        defaultOption.textContent = 'Soru (Genel)';
        questionType.appendChild(defaultOption);
        
        // Diğer soru türlerini ekle
        document.querySelectorAll('.question-type-item').forEach(item => {
            const value = item.getAttribute('data-type');
            if (value !== 'Test') { // Test türünü hariç tut
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                questionType.appendChild(option);
            }
        });
    } else {
        questionTypeContainer.style.display = 'none';
        rubricTypeContainer.style.display = 'block';
        
        // Rubrik tiplerini dinamik olarak doldur
        rubricType.innerHTML = '';
        
        // Önce varsayılan 'Rubrik' seçeneği
        const defaultOption = document.createElement('option');
        defaultOption.value = 'Rubrik';
        defaultOption.textContent = 'Rubrik (Genel)';
        rubricType.appendChild(defaultOption);
        
        // Diğer rubrik türlerini ekle
        document.querySelectorAll('.rubric-item').forEach(item => {
            const value = item.getAttribute('data-type');
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            rubricType.appendChild(option);
        });
    }
    
    // Öğrenme Çıktılarını doldur
    const outcomeSelection = document.getElementById('outcomeSelection');
    outcomeSelection.innerHTML = '';
    
    // Öğrenme çıktılarını ekle
    if (APP_STATE.learningOutcomes && APP_STATE.learningOutcomes.length > 0) {
        APP_STATE.learningOutcomes.forEach(outcome => {
            const option = document.createElement('option');
            option.value = outcome.id;
            option.textContent = `${outcome.id}: ${outcome.aciklama}`;
            outcomeSelection.appendChild(option);
        });
    } else {
        // Öğrenme çıktısı yoksa bilgi mesajı ekle
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = 'Henüz öğrenme çıktısı tanımlanmamış';
        outcomeSelection.appendChild(option);
    }
    
    // Global değişkenleri ayarla
    APP_STATE.multipleItemsNode = APP_STATE.selectedNode;
    APP_STATE.multipleItemsType = type;
    
    // Modalı göster
    openModal(multipleItemsModal);
}

/**
 * Çoklu öğe ekleme işlemini gerçekleştirme
 */
function addMultipleItems() {
    try {
        const count = parseInt(itemCount.value) || 5;
        const type = APP_STATE.multipleItemsType;
        const selectedNode = APP_STATE.multipleItemsNode;
        
        if (!selectedNode) {
            showModernToast("Etkinlik bulunamadı.", "error");
            return;
        }
        
        // Seçilen ÖÇ'leri al
        const outcomeSelection = document.getElementById('outcomeSelection');
        const selectedOutcomes = Array.from(outcomeSelection.selectedOptions).map(option => option.value);
        
        // Mevcut alt öğeleri kontrol et
        const existingChildrenCount = selectedNode.children ? selectedNode.children.length : 0;
        
        // Ağırlık hesaplama
        let newItemWeight = 0;
        
        if (existingChildrenCount === 0) {
            // Hiç alt öğe yoksa, 100'ü eşit böl
            newItemWeight = Math.floor(100 / count);
        } else {
            // Mevcut alt öğelerin toplam ağırlığını hesapla
            const totalExistingWeight = selectedNode.children.reduce((sum, child) => sum + (parseFloat(child.weight) || 0), 0);
            
            // Kalan ağırlığı bul (100'den fazla ise 0 olarak al)
            const remainingWeight = Math.max(0, 100 - totalExistingWeight);
            
            // Kalan ağırlığı eşit böl
            newItemWeight = Math.floor(remainingWeight / count);
            
            // Eğer kalan ağırlık 0 ise, mevcut öğelerin ağırlıklarını yeniden dağıt
            if (remainingWeight <= 0) {
                // Tüm alt öğelerin ağırlıklarını yeniden hesapla
                const totalItems = existingChildrenCount + count;
                const newWeightPerItem = Math.floor(100 / totalItems);
                
                // Mevcut alt öğelerin ağırlıklarını güncelle
                selectedNode.children.forEach(child => {
                    child.weight = newWeightPerItem;
                });
                
                newItemWeight = newWeightPerItem;
            }
        }
        
        // Seçilen tip ve sayıda öğe ekle
        if (type === 'soru') {
            const selectedQuestionType = questionType.value;
            const description = Array.from(document.querySelectorAll('.question-type-item'))
                .find(item => item.getAttribute('data-type') === selectedQuestionType)?.getAttribute('data-description') || '';
            
            // Çoklu soru ekle
            for (let i = 0; i < count; i++) {
                // ÖÇ ataması - dengeli dağıtım için sırayla atama
                let outcome = [];
                if (selectedOutcomes.length > 0) {
                    // i. öğeye i % selectedOutcomes.length indeksindeki ÖÇ'yi ata
                    outcome = [selectedOutcomes[i % selectedOutcomes.length]];
                }
                
                const newNode = {
                    id: `${selectedNode.id}.${(existingChildrenCount + i + 1)}`,
                    name: `${selectedQuestionType} ${existingChildrenCount + i + 1}`,
                    type: selectedQuestionType,
                    weight: newItemWeight,
                    points: 20, // Varsayılan puan
                    outcomes: outcome,
                    description: description || 'Değerlendirme sorusu',
                    expanded: false,
                    children: []
                };
                
                if (!selectedNode.children) {
                    selectedNode.children = [];
                }
                
                selectedNode.children.push(newNode);
            }
            
            showModernToast(`${count} adet "${selectedQuestionType}" sorusu eklendi.`);
        } else {
            const selectedRubricType = rubricType.value;
            const description = Array.from(document.querySelectorAll('.rubric-item'))
                .find(item => item.getAttribute('data-type') === selectedRubricType)?.getAttribute('data-description') || '';
            
            // Çoklu rubrik ekle
            for (let i = 0; i < count; i++) {
                // ÖÇ ataması - dengeli dağıtım için sırayla atama
                let outcome = [];
                if (selectedOutcomes.length > 0) {
                    // i. öğeye i % selectedOutcomes.length indeksindeki ÖÇ'yi ata
                    outcome = [selectedOutcomes[i % selectedOutcomes.length]];
                }
                
                const newNode = {
                    id: `${selectedNode.id}.${(existingChildrenCount + i + 1)}`,
                    name: `${selectedRubricType} ${existingChildrenCount + i + 1}`,
                    type: selectedRubricType,
                    weight: newItemWeight,
                    points: 20, // Varsayılan puan
                    outcomes: outcome,
                    description: description || 'Değerlendirme kriteri',
                    expanded: false,
                    children: []
                };
                
                if (!selectedNode.children) {
                    selectedNode.children = [];
                }
                
                selectedNode.children.push(newNode);
            }
            
            showModernToast(`${count} adet "${selectedRubricType}" rubriği eklendi.`);
        }
        
        // Modal'ı kapat
        closeModal(multipleItemsModal);
        
        // Ana düğümü genişlet
        selectedNode.expanded = true;
        
        // Ağacı yeniden render et
        renderTree();
        
        // Değerlendirme sekmesini güncelle
        updateAssessmentView();
    } catch (error) {
        console.error("Çoklu öğe eklenirken hata oluştu:", error);
        showModernToast("Öğeler eklenemedi!", "error");
    }
}

/**
 * Test sorularına rastgele doğru/yanlış dağılımı yapma
 * @param {string} studentId - Öğrenci ID'si
 * @param {string} testId - Test ID'si
 * @param {number} correct - Doğru sayısı
 * @param {number} wrong - Yanlış sayısı
 */
function distributeTestScores(studentId, testId, correct, wrong) {
    // Modern test dağıtım modalını göster
    showTestScoreDistributionModal(studentId, testId);
}

/**
 * Diziyi karıştırma (Fisher-Yates shuffle algoritması)
 * @param {Array} array - Karıştırılacak dizi
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Puanları eşit olarak dağıt
 * @param {Object} parentNode - Ana etkinlik düğümü
 * @param {number} totalPoints - Toplam puan
 */
function distributePointsEqually(parentNode, totalPoints) {
    if (!parentNode || !parentNode.children || parentNode.children.length === 0) {
        return;
    }
    
    const childCount = parentNode.children.length;
    
    // Eşit dağıtım için temel puanı hesapla
    const basePoint = Math.floor(totalPoints / childCount);
    const remainder = totalPoints - (basePoint * childCount);
    
    // Her alt öğeye eşit puan ver
    parentNode.children.forEach((child, index) => {
        // Son alt öğeye kalan puanları ekle
        if (index === childCount - 1) {
            child.points = basePoint + remainder;
        } else {
            child.points = basePoint;
        }
    });
    
    // Alt öğelerin ağırlıklarını güncelle
    updateSubItemWeights(parentNode);
}

/**
 * Soruların puanlarını rastgele ama dengeli dağıtma
 * @param {Object} parentNode - Ana etkinlik düğümü
 * @param {number} totalPoints - Toplam puan
 */
function distributePointsRandomly(parentNode, totalPoints) {
    if (!parentNode || !parentNode.children || parentNode.children.length === 0) {
        return;
    }
    
    const childCount = parentNode.children.length;
    
    // Dengeli bir dağılım için önce eşit puan ver
    const basePoint = Math.floor(totalPoints / childCount);
    const remainder = totalPoints - (basePoint * childCount);
    
    // ÖÇ'leri grupla
    const outcomeGroups = {};
    parentNode.children.forEach(child => {
        if (child.outcomes && child.outcomes.length > 0) {
            const key = child.outcomes.join(',');
            if (!outcomeGroups[key]) {
                outcomeGroups[key] = [];
            }
            outcomeGroups[key].push(child);
        } else {
            // ÖÇ'si olmayan sorular için özel grup
            if (!outcomeGroups['no_outcome']) {
                outcomeGroups['no_outcome'] = [];
            }
            outcomeGroups['no_outcome'].push(child);
        }
    });
    
    // Düzgün bir dağılım yapabilmek için puan dizisi oluştur
    let points = parentNode.children.map(() => basePoint);
    
    // Kalan puanları rastgele dağıt (her ÖÇ grubuna eşit dağılım yaparak)
    const outcomeKeys = Object.keys(outcomeGroups);
    
    // Her gruba eşit sayıda ek puan dağıt
    const extraPointsPerGroup = Math.floor(remainder / outcomeKeys.length);
    let remainingExtra = remainder - (extraPointsPerGroup * outcomeKeys.length);
    
    outcomeKeys.forEach(key => {
        const group = outcomeGroups[key];
        const extraPointsForThisGroup = group.length > 0 ? Math.floor(extraPointsPerGroup / group.length) : 0;
        let groupRemainder = extraPointsPerGroup - (extraPointsForThisGroup * group.length);
        
        // Her soruya ek puanı ata
        group.forEach(child => {
            const index = parentNode.children.indexOf(child);
            if (index !== -1) {
                points[index] += extraPointsForThisGroup;
            }
        });
        
        // Gruptaki kalan puanları rastgele dağıt
        while (groupRemainder > 0 && group.length > 0) {
            const randomIndex = Math.floor(Math.random() * group.length);
            const childIndex = parentNode.children.indexOf(group[randomIndex]);
            if (childIndex !== -1) {
                points[childIndex]++;
                groupRemainder--;
            }
        }
    });
    
    // Son kalan puanları rastgele dağıt
    while (remainingExtra > 0 && parentNode.children.length > 0) {
        const randomIndex = Math.floor(Math.random() * parentNode.children.length);
        points[randomIndex]++;
        remainingExtra--;
    }
    
    // Puanları çocuk düğümlere ata
    parentNode.children.forEach((child, index) => {
        child.points = points[index];
    });
    
    // Alt öğelerin ağırlıklarını da güncelle
    updateSubItemWeights(parentNode);
}

/**
 * Alt öğelerin ağırlıklarını toplam puana göre günceller
 * @param {Object} parentNode - Ana etkinlik düğümü
 */
function updateSubItemWeights(parentNode) {
    if (!parentNode || !parentNode.children || parentNode.children.length === 0) {
        return;
    }
    
    // Toplam puanı hesapla
    const totalPoints = parentNode.children.reduce((sum, child) => sum + (parseInt(child.points) || 0), 0);
    
    // Her çocuk için ağırlık hesapla
    if (totalPoints > 0) {
        parentNode.children.forEach(child => {
            const childPoints = parseInt(child.points) || 0;
            child.weight = Math.round((childPoints / totalPoints) * 100);
        });
    }
}

/**
 * Soru veya rubrik eklendiğinde/çıkarıldığında puanları yeniden dağıtmak isteyip istemediğini sor
 * @param {Object} parentNode - Ana etkinlik düğümü
 */
function checkAndOfferRedistribution(parentNode) {
    if (!parentNode || !parentNode.children || parentNode.children.length <= 1) {
        return;
    }
    
    // Toplam ağırlığı kontrol et
    const totalWeight = parentNode.children.reduce((sum, child) => sum + (parseInt(child.weight) || 0), 0);
    
    if (totalWeight !== 100) {
        // Modern dağıtım modalını göster
        showDistributePointsModal(parentNode, totalWeight);
    }
}

// =====================================================
// MODERN MODAL & TOAST SİSTEMİ
// =====================================================

/**
 * Modern toast bildirimi gösterme
 * @param {string} message - Bildirim mesajı
 * @param {string} type - Bildirim tipi (success, error, warning, info)
 * @param {number} duration - Görünme süresi (ms)
 */
function showModernToast(message, type = 'success', duration = 4000) {
    const toast = document.getElementById('modernToast');
    const messageElement = document.getElementById('modernToastMessage');
    const iconElement = toast.querySelector('.modern-toast-icon');
    const progressBar = toast.querySelector('.modern-toast-progress-bar');
    
    // Mesajı ayarla
    messageElement.textContent = message;
    
    // İkon ve renk sınıflarını temizle
    iconElement.classList.remove('success', 'error', 'warning', 'info');
    
    // İkon ve renk ayarla
    switch(type) {
        case 'error':
            iconElement.classList.add('error');
            iconElement.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
            progressBar.style.backgroundColor = 'var(--danger-color)';
            break;
        case 'warning':
            iconElement.classList.add('warning');
            iconElement.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
            progressBar.style.backgroundColor = 'var(--warning-color)';
            break;
        case 'info':
            iconElement.classList.add('info');
            iconElement.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
            progressBar.style.backgroundColor = 'var(--info-color)';
            break;
        default: // success
            iconElement.classList.add('success');
            iconElement.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
            progressBar.style.backgroundColor = 'var(--success-color)';
    }
    
    // Animasyon süresini ayarla
    progressBar.style.animation = `progressShrink ${duration/1000}s linear forwards`;
    
    // Toastı göster
    toast.style.display = 'block';
    
    // Belirtilen süre sonra kapat
    const toastTimeout = setTimeout(() => {
        toast.style.display = 'none';
    }, duration);
    
    // Kapatma butonuna tıklandığında
    toast.querySelector('.modern-toast-close').onclick = function() {
        clearTimeout(toastTimeout);
        toast.style.display = 'none';
    };
}

/**
 * Modern modal açma
 * @param {string} modalId - Modal element ID'si
 */
function openModernModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * Modern modal kapatma
 * @param {string} modalId - Modal element ID'si
 */
function closeModernModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Silme onay modalını gösterme
 * @param {Function} confirmCallback - Onay verildiğinde çalışacak fonksiyon
 * @param {string} message - Gösterilecek mesaj
 */
function showDeleteConfirmModal(confirmCallback, message = 'Bu öğeyi silmek istediğinizden emin misiniz?') {
    const modal = document.getElementById('deleteConfirmModal');
    const messageElement = document.getElementById('deleteConfirmMessage');
    const confirmButton = document.getElementById('confirmDeleteBtn');
    
    // Mesajı ayarla
    messageElement.textContent = message;
    
    // Onay butonuna tıklandığında
    confirmButton.onclick = function() {
        if (typeof confirmCallback === 'function') {
            confirmCallback();
        }
        closeModernModal('deleteConfirmModal');
    };
    
    // Modalı göster
    openModernModal('deleteConfirmModal');
}

/**
 * Puan dağıtım modalını gösterme
 * @param {Object} parentNode - Ana düğüm
 * @param {number} totalWeight - Mevcut toplam ağırlık
 */
function showDistributePointsModal(parentNode, totalWeight) {
    const modal = document.getElementById('distributePointsModal');
    const totalWeightElement = document.getElementById('currentTotalWeight');
    const confirmButton = document.getElementById('confirmDistributeBtn');
    const totalPointsInput = document.getElementById('totalPointsInput');
    const equalOption = document.getElementById('equalOption');
    const randomOption = document.getElementById('randomOption');
    
    let selectedDistribution = null;
    
    // Toplam ağırlığı göster
    totalWeightElement.textContent = totalWeight;
    
    // Seçim yapılana kadar onay butonunu devre dışı bırak
    confirmButton.disabled = true;
    
    // Dağıtım seçeneklerine tıklandığında
    equalOption.onclick = function() {
        equalOption.classList.add('selected');
        randomOption.classList.remove('selected');
        selectedDistribution = 'equal';
        confirmButton.disabled = false;
    };
    
    randomOption.onclick = function() {
        randomOption.classList.add('selected');
        equalOption.classList.remove('selected');
        selectedDistribution = 'random';
        confirmButton.disabled = false;
    };
    
    // Onay butonuna tıklandığında
    confirmButton.onclick = function() {
        const totalPoints = parseInt(totalPointsInput.value) || 100;
        
        if (selectedDistribution === 'equal') {
            distributePointsEqually(parentNode, totalPoints);
            showModernToast(`Puanlar ${parentNode.name} etkinliğine eşit olarak dağıtıldı.`, 'success');
        } else if (selectedDistribution === 'random') {
            distributePointsRandomly(parentNode, totalPoints);
            showModernToast(`Puanlar ${parentNode.name} etkinliğine rastgele dağıtıldı.`, 'success');
        }
        
        // Modalı kapat
        closeModernModal('distributePointsModal');
        
        // Ağacı yeniden render et
        renderTree();
        
        // Değerlendirme sekmesini güncelle
        updateAssessmentView();
    };
    
    // Modalı göster
    openModernModal('distributePointsModal');
    
    // Seçimleri sıfırla
    equalOption.classList.remove('selected');
    randomOption.classList.remove('selected');
}

/**
 * Test skoru dağıtım modalını gösterme
 * @param {string} studentId - Öğrenci ID'si
 * @param {string} testId - Test ID'si
 */
function showTestScoreDistributionModal(studentId, testId) {
    const modal = document.getElementById('testScoreDistributionModal');
    const testNode = findNodeById(testId);
    const student = APP_STATE.studentData.find(s => s.studentId === studentId);
    
    if (!testNode || !student) {
        showModernToast("Test veya öğrenci bilgisi bulunamadı!", "error");
        return;
    }
    
    // Test bilgilerini ayarla
    document.getElementById('testStudentName').textContent = `${student.name} ${student.surname} (${studentId})`;
    document.getElementById('testName').textContent = testNode.name;
    document.getElementById('testTotalQuestions').textContent = testNode.testDetails.totalQuestions;
    
    const totalQuestions = testNode.testDetails.totalQuestions;
    const correctWeight = testNode.testDetails.correctWeight;
    const wrongPenalty = Math.abs(testNode.testDetails.wrongPenalty);
    
    // Slider'ları ayarla
    const correctSlider = document.getElementById('testCorrectSlider');
    const wrongSlider = document.getElementById('testWrongSlider');
    correctSlider.max = totalQuestions;
    wrongSlider.max = totalQuestions;
    
    // Mevcut değerleri al
    let correct = 0;
    let wrong = 0;
    
    // Öğrencinin mevcut test verilerini kontrol et
    if (APP_STATE.gradesData[studentId] && APP_STATE.gradesData[studentId][testId]) {
        const testData = APP_STATE.gradesData[studentId][testId];
        if (testData.tip === 'test' || testData.type === 'test') {
            correct = testData.dogru || testData.correct || 0;
            wrong = testData.yanlis || testData.wrong || 0;
        }
    }
    
    // Slider ve değerleri güncelle
    correctSlider.value = correct;
    wrongSlider.value = wrong;
    updateTestDistributionPreview(correct, wrong, totalQuestions, correctWeight, wrongPenalty);
    
    // Slider olayları
    correctSlider.oninput = function() {
        const correctValue = parseInt(this.value);
        const wrongValue = parseInt(wrongSlider.value);
        
        // Toplam soru sayısını kontrol et
        if (correctValue + wrongValue > totalQuestions) {
            wrongSlider.value = totalQuestions - correctValue;
            wrong = totalQuestions - correctValue;
        }
        
        correct = correctValue;
        updateTestDistributionPreview(correct, wrong, totalQuestions, correctWeight, wrongPenalty);
    };
    
    wrongSlider.oninput = function() {
        const wrongValue = parseInt(this.value);
        const correctValue = parseInt(correctSlider.value);
        
        // Toplam soru sayısını kontrol et
        if (correctValue + wrongValue > totalQuestions) {
            correctSlider.value = totalQuestions - wrongValue;
            correct = totalQuestions - wrongValue;
        }
        
        wrong = wrongValue;
        updateTestDistributionPreview(correct, wrong, totalQuestions, correctWeight, wrongPenalty);
    };
    
    // Rastgele dağıt butonu
    document.getElementById('randomizeTestDistribution').onclick = function() {
        // Rastgele doğru sayısı üret
        const randomCorrect = Math.floor(Math.random() * (totalQuestions + 1));
        
        // Rastgele yanlış sayısı üret (toplam soruyu geçmeyecek şekilde)
        const maxWrong = totalQuestions - randomCorrect;
        const randomWrong = Math.floor(Math.random() * (maxWrong + 1));
        
        // Değerleri güncelle
        correctSlider.value = randomCorrect;
        wrongSlider.value = randomWrong;
        correct = randomCorrect;
        wrong = randomWrong;
        
        updateTestDistributionPreview(correct, wrong, totalQuestions, correctWeight, wrongPenalty);
    };
    
    // Uygula butonu
    document.getElementById('applyTestDistribution').onclick = function() {
        // Test skorunu kaydet
        saveTestDistribution(studentId, testId, correct, wrong);
        
        // Modalı kapat
        closeModernModal('testScoreDistributionModal');
        
        showModernToast(`${student.name} ${student.surname} için test puanı güncellendi.`, "success");
    };
    
    // Modalı göster
    openModernModal('testScoreDistributionModal');
}

/**
 * Test dağılım önizlemesini güncelleme
 */
function updateTestDistributionPreview(correct, wrong, totalQuestions, correctWeight, wrongPenalty) {
    document.getElementById('testCorrectValue').textContent = correct;
    document.getElementById('testWrongValue').textContent = wrong;
    
    const empty = totalQuestions - correct - wrong;
    document.getElementById('testEmptyValue').textContent = empty;
    
    // Toplam puanı hesapla
    const totalScore = (correct * correctWeight) - (wrong * wrongPenalty);
    document.getElementById('testTotalScore').textContent = totalScore.toFixed(1);
    
    // Dağılım önizlemesini güncelle
    const previewElement = document.getElementById('distributionPreview');
    previewElement.innerHTML = '';
    
    // Doğru oranı
    if (correct > 0) {
        const correctBlock = document.createElement('div');
        correctBlock.className = 'question-block question-correct';
        correctBlock.style.width = `${(correct / totalQuestions) * 100}%`;
        previewElement.appendChild(correctBlock);
    }
    
    // Yanlış oranı
    if (wrong > 0) {
        const wrongBlock = document.createElement('div');
        wrongBlock.className = 'question-block question-wrong';
        wrongBlock.style.width = `${(wrong / totalQuestions) * 100}%`;
        previewElement.appendChild(wrongBlock);
    }
    
    // Boş oranı
    if (empty > 0) {
        const emptyBlock = document.createElement('div');
        emptyBlock.className = 'question-block question-empty';
        emptyBlock.style.width = `${(empty / totalQuestions) * 100}%`;
        previewElement.appendChild(emptyBlock);
    }
}

/**
 * Test dağılımını kaydetme
 */
function saveTestDistribution(studentId, testId, correct, wrong) {
    // Öğrenci verisi oluştur
    if (!APP_STATE.gradesData[studentId]) {
        APP_STATE.gradesData[studentId] = {};
    }
    
    // Test verisini kaydet
    APP_STATE.gradesData[studentId][testId] = {
        tip: 'test',
        type: 'test',
        dogru: correct,
        correct: correct,
        yanlis: wrong,
        wrong: wrong
    };
    
    // Alt düğüm yapısını oluştur (gerekiyorsa)
    const parts = testId.split('.');
    if (parts.length > 1) {
        const parentId = parts[0]; // Örneğin: A1
        const shortId = parts[parts.length - 1]; // Örneğin: 1
        
        // Eğer üst aktivite yoksa oluştur
        if (!APP_STATE.gradesData[studentId][parentId]) {
            APP_STATE.gradesData[studentId][parentId] = {
                toplam: 0
            };
        }
        
        // Kısa kod da ekle
        APP_STATE.gradesData[studentId][parentId][shortId] = {
            tip: 'test',
            type: 'test',
            dogru: correct,
            correct: correct,
            yanlis: wrong,
            wrong: wrong
        };
        
        // Alt yapıya da ekle
        APP_STATE.gradesData[studentId][parentId][testId] = {
            tip: 'test',
            type: 'test',
            dogru: correct,
            correct: correct,
            yanlis: wrong,
            wrong: wrong
        };
        
        // Toplama hesapla
        updateParentActivityTotal(studentId, parentId);
    }
    
    // Değerlendirme sekmesini güncelle
    updateAssessmentView();
    
    // Notları yeniden hesapla
    updateStudentCalculatedGrade(studentId);
    
    // Öğrenci görünümünü güncelle
    updateStudentViewTestTotal(studentId, testId);
}

// Modal kapatma düğmelerini ayarla
document.addEventListener('DOMContentLoaded', function() {
    // Tüm modern kapatma butonlarına tıklama olayı ekle
    document.querySelectorAll('.modern-close').forEach(button => {
        button.addEventListener('click', function() {
            // En yakın modal elementini bul
            const modal = this.closest('.modern-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Modal dışına tıklanınca kapatma
    document.querySelectorAll('.modern-modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
});
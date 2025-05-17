document.addEventListener('DOMContentLoaded', () => {
    const consultantSelect = document.getElementById('consultant-select');
    const cvUploadInput = document.getElementById('cv-upload');
    const transformButton = document.getElementById('transform-button');
    const cvPreviewArea = document.getElementById('cv-preview-area');
    const processingStatus = document.getElementById('processing-status');

    // Webhook endpoint (replace with actual n8n webhook URL when available)
    const N8N_WEBHOOK_URL = 'https://primary-production-689f.up.railway.app/webhook/03c2874d-473a-4de2-a4bc-3ccde725f1fc';

    // Event listener for consultant selection (future use)
    if (consultantSelect) {
        consultantSelect.addEventListener('change', (event) => {
            const selectedConsultant = event.target.value;
            console.log('Consultant selected:', selectedConsultant);
            // Here you might fetch the consultant's CV or other data
            updateProcessingStatus(`Consultant ${selectedConsultant} sélectionné.`);
            // Reset file input if a consultant is chosen
            if (cvUploadInput) {
                cvUploadInput.value = ''; 
            }
            clearCvPreview();
        });
    }

    // Event listener for file input
    if (cvUploadInput) {
        cvUploadInput.addEventListener('change', handleFileSelect);
    }

    // Event listener for the transform button
    if (transformButton) {
        transformButton.addEventListener('click', handleTransformClick);
    }

    /**
     * Handles the file selection event.
     * @param {Event} event - The file input change event.
     */
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            console.log('File selected:', file.name, file.type, file.size);
            if (validateFile(file)) {
                previewFile(file);
                updateProcessingStatus(`Fichier "${file.name}" prêt pour transformation.`);
                // If a file is manually uploaded, deselect consultant
                if (consultantSelect) {
                    consultantSelect.value = '';
                }
            } else {
                // Reset file input if validation fails
                event.target.value = ''; 
            }
        } else {
            clearCvPreview();
            updateProcessingStatus('Aucun fichier sélectionné.');
        }
    }

    /**
     * Validates the selected file.
     * For now, it only checks if it's a PDF.
     * @param {File} file - The file to validate.
     * @returns {boolean} - True if the file is valid, false otherwise.
     */
    function validateFile(file) {
        if (!file) {
            updateProcessingStatus('Erreur : Aucun fichier fourni.', true);
            return false;
        }
        if (file.type !== 'application/pdf') {
            updateProcessingStatus(`Erreur : Le fichier "${file.name}" n'est pas un PDF. Veuillez sélectionner un fichier PDF.`, true);
            alert(`Erreur : Le fichier "${file.name}" n'est pas un PDF. Veuillez sélectionner un fichier PDF.`);
            return false;
        }
        // Add size validation if needed (e.g., max 10MB)
        // const maxSize = 10 * 1024 * 1024; // 10MB
        // if (file.size > maxSize) {
        //     updateProcessingStatus(`Erreur : Le fichier est trop volumineux (max 10MB).`, true);
        //     alert(`Erreur : Le fichier est trop volumineux (max 10MB).`);
        //     return false;
        // }
        return true;
    }

    /**
     * Displays a preview of the selected file (placeholder).
     * @param {File} file - The file to preview.
     */
    function previewFile(file) {
        if (cvPreviewArea) {
            // For now, just display the file name and type.
            // PDF.js integration will happen in a later step.
            cvPreviewArea.innerHTML = `<p>Fichier sélectionné : ${file.name} (${(file.size / 1024).toFixed(2)} KB)</p><p>Type : ${file.type}</p>`;
            cvPreviewArea.style.color = 'var(--klanik-dark-text)'; // Make text visible
        }
    }
    
    /**
     * Clears the CV preview area.
     */
    function clearCvPreview() {
        if (cvPreviewArea) {
            cvPreviewArea.innerHTML = '<p>L\'aperçu du CV apparaîtra ici.</p>';
            cvPreviewArea.style.color = 'var(--klanik-grey-border)';
        }
    }

    /**
     * Handles the click event of the "Transform" button.
     */
    async function handleTransformClick() {
        const selectedFile = cvUploadInput ? cvUploadInput.files[0] : null;
        const selectedConsultant = consultantSelect ? consultantSelect.value : null;

        if (!selectedFile && !selectedConsultant) {
            updateProcessingStatus('Veuillez sélectionner un consultant ou télécharger un CV.', true);
            alert('Veuillez sélectionner un consultant ou télécharger un CV.');
            return;
        }

        if (selectedFile) {
            if (!validateFile(selectedFile)) {
                return; // Validation failed, message already shown
            }
            updateProcessingStatus(`Transformation du fichier "${selectedFile.name}" en cours...`);
            await sendFileToWebhook(selectedFile);
            // setTimeout(() => { // Placeholder for actual webhook call
            //     updateProcessingStatus(`Traitement de "${selectedFile.name}" terminé (simulation).`);
            //     // handleTransformedPDF(new Blob(["Simulated PDF content"], { type: "application/pdf" }));
            // }, 2000);
        } else if (selectedConsultant) {
            // Logic to get CV based on consultant (to be implemented)
            updateProcessingStatus(`Recherche du CV pour ${consultantSelect.options[consultantSelect.selectedIndex].text}...`);
            // For now, we assume if a consultant is selected, we don't have a file to send directly.
            // This part will need further logic if consultant selection implies fetching a CV then sending it.
            // For this step, we focus on the manual file upload.
            // Simulate fetching and processing for now
            setTimeout(() => { // Placeholder for actual CV fetching and webhook call
                updateProcessingStatus(`Logique pour le consultant ${consultantSelect.options[consultantSelect.selectedIndex].text} à implémenter. Pour l'instant, veuillez télécharger un fichier manuellement pour tester l'envoi au webhook.`);
            }, 1000);
        }
    }

    /**
     * Sends the file to the n8n webhook.
     * (This is a placeholder and will be fully implemented in Étape 4)
     * @param {File} file - The file to send.
     */
    async function sendFileToWebhook(file) {
        const formData = new FormData();
        formData.append('file', file); // n8n expects the file under the key 'file'

        updateProcessingStatus(`Envoi de "${file.name}" au webhook...`);
        transformButton.disabled = true;

        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                body: formData,
                // 'Content-Type': 'multipart/form-data' is automatically set by browser with FormData
            });

            if (response.ok) {
                const transformedPdfBlob = await response.blob();
                updateProcessingStatus(`Fichier "${file.name}" transformé avec succès!`);
                handleTransformedPDF(transformedPdfBlob, `CV_${file.name.replace(/\.pdf$/i, '')}_Klanik_Transformé.pdf`);
            } else {
                const errorText = await response.text();
                console.error('Webhook error response:', errorText);
                updateProcessingStatus(`Erreur lors du traitement du fichier "${file.name}". Statut: ${response.status}. ${errorText}`, true);
                alert(`Erreur du serveur: ${response.status}. Détails: ${errorText}`);
            }
        } catch (error) {
            console.error('Erreur de connexion au webhook:', error);
            updateProcessingStatus(`Erreur de connexion lors de l'envoi du fichier "${file.name}". Vérifiez la console.`, true);
            alert(`Erreur de connexion: ${error.message}`);
        } finally {
            transformButton.disabled = false;
        }
    }
    
    /**
     * Handles the transformed PDF received from the webhook.
     * (This is a placeholder and will be fully implemented in Étape 5)
     * @param {Blob} pdfBlob - The transformed PDF data as a Blob.
     * @param {string} fileName - The suggested file name for the download.
     */
    function handleTransformedPDF(pdfBlob, fileName = 'CV_Klanik_Transformé.pdf') {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        updateProcessingStatus(`Le fichier transformé "${fileName}" a été téléchargé.`);
        
        // Clear file input and preview after successful processing
        if(cvUploadInput) cvUploadInput.value = '';
        clearCvPreview();
        if(consultantSelect) consultantSelect.value = '';
    }


    /**
     * Updates the processing status message.
     * @param {string} message - The message to display.
     * @param {boolean} isError - Optional. True if the message is an error.
     */
    function updateProcessingStatus(message, isError = false) {
        if (processingStatus) {
            processingStatus.innerHTML = `<p>${message}</p>`;
            processingStatus.style.color = isError ? 'red' : 'var(--klanik-dark-text)';
        }
        console.log(isError ? `Error: ${message}` : `Status: ${message}`);
    }
});

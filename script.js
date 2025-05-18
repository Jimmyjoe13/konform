document.addEventListener('DOMContentLoaded', () => {
    const consultantSelect = document.getElementById('consultant-select');
    const cvUploadInput = document.getElementById('cv-upload');
    const cvUploadButton = document.getElementById('cv-upload-button');
    const dropZone = document.getElementById('drop-zone');
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
        cvUploadInput.addEventListener('change', (event) => processFile(event.target.files[0]));
    }

    // Event listener for the "Sélectionner un fichier" button
    if (cvUploadButton) {
        cvUploadButton.addEventListener('click', () => {
            if (cvUploadInput) {
                cvUploadInput.click();
            }
        });
    }

    // Event listeners for drag and drop
    if (dropZone) {
        dropZone.addEventListener('click', () => { // Allow click on drop zone to open file dialog
            if (cvUploadInput) {
                cvUploadInput.click();
            }
        });
        dropZone.addEventListener('dragover', (event) => {
            event.preventDefault(); // Prevent default behavior (Prevent file from being opened)
            dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        dropZone.addEventListener('drop', (event) => {
            event.preventDefault();
            dropZone.classList.remove('drag-over');
            if (event.dataTransfer.files && event.dataTransfer.files[0]) {
                const file = event.dataTransfer.files[0];
                processFile(file);
                // Manually set the file to the input for consistency, though not strictly necessary if processFile handles it
                // This helps if other parts of the script expect cvUploadInput.files to be populated
                if (cvUploadInput) {
                    try {
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);
                        cvUploadInput.files = dataTransfer.files;
                    } catch (e) {
                        console.warn("Could not set files on input type=file programmatically:", e);
                        // Fallback or alternative handling if direct assignment isn't supported/working
                    }
                }
            }
        });
    }

    // Event listener for the transform button
    if (transformButton) {
        transformButton.addEventListener('click', handleTransformClick);
    }

    /**
     * Processes the selected file (either from input or drag & drop).
     * @param {File} file - The file object.
     */
    function processFile(file) {
        if (file) {
            console.log('File selected/dropped:', file.name, file.type, file.size);
            if (validateFile(file)) {
                previewFile(file);
                updateProcessingStatus(`Fichier "${file.name}" prêt pour transformation.`);
                if (consultantSelect) {
                    consultantSelect.value = ''; // Deselect consultant if a file is chosen
                }
            } else {
                if (cvUploadInput) {
                    cvUploadInput.value = ''; // Reset file input if validation fails
                }
            }
        } else {
            clearCvPreview();
            updateProcessingStatus('Aucun fichier sélectionné.');
        }
    }

    /**
     * Validates the selected file.
     * For now, it only checks if it's a PDF or DOCX.
     * @param {File} file - The file to validate.
     * @returns {boolean} - True if the file is valid, false otherwise.
     */
    function validateFile(file) {
        if (!file) {
            updateProcessingStatus('Erreur : Aucun fichier fourni.', true);
            return false;
        }
        const acceptedTypes = [
            'application/pdf', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
        ];
        if (!acceptedTypes.includes(file.type)) {
            updateProcessingStatus(`Erreur : Le fichier "${file.name}" n'est pas un PDF ou un DOCX. Veuillez sélectionner un fichier PDF ou DOCX.`, true);
            alert(`Erreur : Le fichier "${file.name}" n'est pas un PDF ou un DOCX. Veuillez sélectionner un fichier PDF ou DOCX.`);
            return false;
        }
        
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            updateProcessingStatus(`Erreur : Le fichier "${file.name}" est trop volumineux (max 10MB). Sa taille est de ${(file.size / 1024 / 1024).toFixed(2)} MB.`, true);
            alert(`Erreur : Le fichier "${file.name}" est trop volumineux (max 10MB). Sa taille est de ${(file.size / 1024 / 1024).toFixed(2)} MB.`);
            return false;
        }
        return true;
    }

    /**
     * Displays a preview of the selected PDF file using PDF.js, or a message for DOCX.
     * @param {File} file - The file to preview.
     */
    async function previewFile(file) {
        if (!cvPreviewArea || !file) {
            if (cvPreviewArea) {
                cvPreviewArea.innerHTML = '<p>Erreur lors de l\'initialisation de l\'aperçu.</p>';
                cvPreviewArea.style.color = 'red';
            }
            console.error('cvPreviewArea is null.');
            return;
        }

        cvPreviewArea.innerHTML = ''; // Clear previous preview or placeholder text
        cvPreviewArea.style.color = 'var(--klanik-dark-text)'; // Reset color

        // Display basic metadata for all file types
        const metadataDiv = document.createElement('div');
        let filePages = 'N/A'; // Default for non-PDFs

        if (file.type === 'application/pdf' && typeof pdfjsLib !== 'undefined') {
            const fileReader = new FileReader();
            fileReader.onload = async function() {
                const typedarray = new Uint8Array(this.result);
                try {
                    const loadingTask = pdfjsLib.getDocument({data: typedarray});
                    const pdf = await loadingTask.promise;
                    filePages = pdf.numPages;
                    
                    if (pdf.numPages === 0) {
                        cvPreviewArea.innerHTML = '<p>Le PDF ne contient aucune page.</p>';
                    } else {
                        const pageNumber = 1; // Preview the first page
                        const page = await pdf.getPage(pageNumber);
                        
                        const viewport = page.getViewport({ scale: 1 });
                        const desiredWidth = cvPreviewArea.clientWidth > 0 ? cvPreviewArea.clientWidth - 20 : 250; // Subtract padding
                        const scaledViewport = page.getViewport({ scale: desiredWidth / viewport.width });

                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.height = scaledViewport.height;
                        canvas.width = scaledViewport.width;
                        canvas.style.maxWidth = '100%';
                        canvas.style.maxHeight = '300px'; 

                        const renderContext = {
                            canvasContext: context,
                            viewport: scaledViewport
                        };
                        await page.render(renderContext).promise;
                        cvPreviewArea.appendChild(canvas);
                    }
                } catch (reason) {
                    console.error('Error during PDF preview rendering: ', reason);
                    cvPreviewArea.innerHTML = `<p>Impossible d'afficher l'aperçu du PDF. Le fichier est peut-être corrompu ou non supporté.</p>`;
                    cvPreviewArea.style.color = 'red';
                } finally {
                    appendMetadata(); // Append metadata after PDF processing
                }
            };
            fileReader.onerror = function() {
                console.error('FileReader error.');
                cvPreviewArea.innerHTML = '<p>Erreur lors de la lecture du fichier PDF.</p>';
                cvPreviewArea.style.color = 'red';
                appendMetadata(); // Still try to append metadata
            };
            fileReader.readAsArrayBuffer(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const docxMessage = document.createElement('p');
            docxMessage.textContent = `Fichier DOCX sélectionné : ${file.name}. L'aperçu n'est pas disponible pour les fichiers DOCX.`;
            cvPreviewArea.appendChild(docxMessage);
            appendMetadata(); // Append metadata for DOCX
        } else {
            // Fallback for other unexpected types, though validation should prevent this
            const unknownMessage = document.createElement('p');
            unknownMessage.textContent = `Type de fichier non supporté pour l'aperçu : ${file.name}`;
            cvPreviewArea.appendChild(unknownMessage);
            appendMetadata(); // Append metadata
        }

        function appendMetadata() {
            metadataDiv.innerHTML = `
                <p style="margin-top: 10px; font-size: 0.9em;">
                    Nom: ${file.name}<br>
                    Type: ${file.type}<br>
                    Taille: ${(file.size / 1024).toFixed(2)} KB<br>
                    ${file.type === 'application/pdf' ? `Pages: ${filePages}` : ''}
                </p>`;
            cvPreviewArea.appendChild(metadataDiv);
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
        updateProcessingStatus(`Lecture du fichier "${file.name}" en format binaire...`);
        transformButton.disabled = true;

        const reader = new FileReader();

        reader.onload = async (event) => {
            const fileArrayBuffer = event.target.result; // This is the ArrayBuffer

            updateProcessingStatus(`Envoi de "${file.name}" (binaire) au webhook...`);

            try {
                const response = await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/octet-stream', // Indicate binary data
                        // Add a filename header if n8n needs it explicitly
                        'X-Filename': file.name 
                    },
                    body: fileArrayBuffer, // Send the ArrayBuffer directly
                });

                if (response.ok) {
                    const transformedPdfBlob = await response.blob();
                    // Ensure the filename for download is correctly generated
                    const originalFileNameWithoutExtension = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                    handleTransformedPDF(transformedPdfBlob, `CV_${originalFileNameWithoutExtension}_Klanik_Transformé.pdf`);
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
        };

        reader.onerror = () => {
            console.error('FileReader error.');
            updateProcessingStatus(`Erreur lors de la lecture du fichier "${file.name}".`, true);
            alert(`Erreur lors de la lecture du fichier.`);
            transformButton.disabled = false;
        };

        reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer
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

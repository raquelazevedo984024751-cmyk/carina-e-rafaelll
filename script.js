// ========================================
// CONFIGURAÇÃO DO CLOUDINARY
// ========================================

const CLOUD_NAME = "ne8kkec1";
const UPLOAD_PRESET = "ml default";

const CLOUDINARY_URL =
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;


// ========================================
// ELEMENTOS
// ========================================

const photoInput = document.getElementById("photoInput");
const preview = document.getElementById("preview");
const sendButton = document.getElementById("sendButton");
const status = document.getElementById("status");
const gallery = document.getElementById("gallery");


// ========================================
// FOTOS SELECIONADAS
// ========================================

let selectedFiles = [];


// ========================================
// ESCOLHER FOTOS
// ========================================

photoInput.addEventListener("change", function () {

    const files = Array.from(this.files);

    selectedFiles = [
        ...selectedFiles,
        ...files
    ];

    mostrarPreview();

});


// ========================================
// MOSTRAR PREVIEW
// ========================================

function mostrarPreview() {

    preview.innerHTML = "";

    selectedFiles.forEach((file, index) => {

        const reader = new FileReader();

        reader.onload = function (event) {

            const item = document.createElement("div");

            item.className = "preview-item";

            item.innerHTML = `
                <img
                    src="${event.target.result}"
                    alt="Foto selecionada"
                >

                <button
                    class="remove-photo"
                    onclick="removerFoto(${index})"
                    type="button"
                >
                    ×
                </button>
            `;

            preview.appendChild(item);

        };

        reader.readAsDataURL(file);

    });

    sendButton.disabled =
        selectedFiles.length === 0;

}


// ========================================
// REMOVER FOTO
// ========================================

function removerFoto(index) {

    selectedFiles.splice(index, 1);

    mostrarPreview();

}


// ========================================
// ENVIAR UMA FOTO PARA O CLOUDINARY
// ========================================

async function enviarParaCloudinary(file) {

    const formData = new FormData();

    formData.append("file", file);

    formData.append(
        "upload_preset",
        UPLOAD_PRESET
    );


    const resposta = await fetch(
        CLOUDINARY_URL,
        {
            method: "POST",
            body: formData
        }
    );


    if (!resposta.ok) {

        const erro = await resposta.text();

        console.error(
            "Erro do Cloudinary:",
            erro
        );

        throw new Error(
            "Não foi possível enviar a foto."
        );

    }


    return await resposta.json();

}


// ========================================
// ADICIONAR FOTO NA GALERIA
// ========================================

function adicionarNaGaleria(url) {

    const emptyGallery =
        gallery.querySelector(".empty-gallery");


    if (emptyGallery) {

        emptyGallery.remove();

    }


    const photo =
        document.createElement("div");


    photo.className =
        "gallery-photo";


    photo.innerHTML = `

        <img
            src="${url}"
            alt="Foto compartilhada do casamento"
            loading="lazy"
        >

        <a
            href="${url}"
            target="_blank"
            class="download-button"
            title="Baixar foto"
        >
            ↓
        </a>

    `;


    gallery.appendChild(photo);

}


// ========================================
// BOTÃO ADICIONAR AO ÁLBUM
// ========================================

sendButton.addEventListener(
    "click",
    async function () {

        if (selectedFiles.length === 0) {
            return;
        }


        // Desativa o botão durante o envio

        sendButton.disabled = true;

        photoInput.disabled = true;


        status.textContent =
            "Enviando suas fotos...";


        let enviadas = 0;


        try {

            for (
                const file of selectedFiles
            ) {

                status.textContent =
                    `Enviando foto ${enviadas + 1} de ${selectedFiles.length}...`;


                const resultado =
                    await enviarParaCloudinary(file);


                // URL segura da foto no Cloudinary

                const url =
                    resultado.secure_url;


                // Mostra na galeria

                adicionarNaGaleria(url);


                enviadas++;

            }


            status.textContent =
                `${enviadas} foto${enviadas > 1 ? "s" : ""} enviada${enviadas > 1 ? "s" : ""} com sucesso!`;


            // Limpa seleção

            selectedFiles = [];

            photoInput.value = "";

            preview.innerHTML = "";


        } catch (erro) {

            console.error(erro);


            status.textContent =
                "Não foi possível enviar uma ou mais fotos. Tente novamente.";


        } finally {

            sendButton.disabled =
                selectedFiles.length === 0;

            photoInput.disabled = false;

        }

    }
);


// ========================================
// NAVEGAÇÃO SUAVE
// ========================================

document
    .querySelectorAll('a[href^="#"]')
    .forEach(function (link) {

        link.addEventListener(
            "click",
            function (event) {

                const target =
                    document.querySelector(
                        this.getAttribute("href")
                    );


                if (target) {

                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            }
        );

    });
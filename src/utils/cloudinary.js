const CLOUD_NAME = "dggvnbw4a";
const UPLOAD_PRESET = "recrun_lens";

function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(",");
  const mime = parts[0].match(/:(.*?);/)[1];
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export async function uploadToCloudinary(
  fileOrDataUrl,
  options = {}
) {
  const {
    cloudName = CLOUD_NAME,
    uploadPreset = UPLOAD_PRESET,
    folder = null,
    public_id_prefix = null,
    tags = [],
    transformation = null,
    allowedFormats = ["image/jpeg", "image/png", "image/webp"],
    maxFileSizeMB = 20,
    returnType = "secure_url",
    convertDataUrl = true,
    extraContext = null,
  } = options;

  let uploadBlob;
  if (typeof fileOrDataUrl === "string") {
    if (!convertDataUrl) throw new Error("String provided but convertDataUrl=false.");
    uploadBlob = dataURLtoBlob(fileOrDataUrl);
  } else {
    uploadBlob = fileOrDataUrl;
  }

  if (uploadBlob.type && allowedFormats.length > 0) {
    if (!allowedFormats.includes(uploadBlob.type)) {
      throw new Error(`File type "${uploadBlob.type}" not allowed.`);
    }
  }

  if (maxFileSizeMB && uploadBlob.size) {
    const maxBytes = maxFileSizeMB * 1024 * 1024;
    if (uploadBlob.size > maxBytes) {
      throw new Error(`File too large. Max ${maxFileSizeMB} MB.`);
    }
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const fd = new FormData();
  fd.append("file", uploadBlob);
  fd.append("upload_preset", uploadPreset);

  if (folder) fd.append("folder", folder);
  if (tags && tags.length) fd.append("tags", tags.join(","));
  if (transformation) fd.append("transformation", transformation);
  if (public_id_prefix) {
    const ts = Date.now();
    const random = Math.floor(Math.random() * 9000) + 1000;
    fd.append("public_id", `${public_id_prefix}_${ts}_${random}`);
  }
  if (extraContext) fd.append("context", extraContext);

  const res = await fetch(url, { method: "POST", body: fd });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${txt}`);
  }
  const data = await res.json();

  if (returnType === "secure_url") return data.secure_url;
  return data;
}
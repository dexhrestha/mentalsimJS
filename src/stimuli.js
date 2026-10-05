const imageCache = new Map();

export function imageMetaFromId(imageId, nCatImages = 2) {
  const zeroBased = imageId - 1;
  return {
    categoryIndex: Math.floor(zeroBased / nCatImages) + 1,
    imageIndex: (zeroBased % nCatImages) + 1
  };
}

export function stimulusUrl(categoryIndex, imageIndex, params) {
  const sequenceName = `sequence_${String(params.seqid).padStart(2, "0")}`;
  return `${params.stimulusBasePath}/${params.cohortDir}/${sequenceName}/pos_${categoryIndex}_img_${imageIndex}.png`;
}

export function stimulusUrlFromId(imageId, params) {
  const { categoryIndex, imageIndex } = imageMetaFromId(imageId, params.nCatImages);
  return stimulusUrl(categoryIndex, imageIndex, params);
}

export function preloadStimulusImages(params) {
  const urls = [];
  for (let cat = 1; cat <= params.categories.length; cat += 1) {
    for (let img = 1; img <= params.nCatImages; img += 1) {
      urls.push(stimulusUrl(cat, img, params));
    }
  }

  return Promise.all(
    urls.map((url) => {
      if (imageCache.has(url)) return imageCache.get(url).promise;

      const image = new Image();
      const promise = new Promise((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Could not load stimulus image: ${url}`));
      });

      image.src = url;
      imageCache.set(url, { image, promise });
      return promise;
    })
  );
}

export function getStimulusImage(imageId, params) {
  const url = stimulusUrlFromId(imageId, params);
  return imageCache.get(url)?.image ?? null;
}

export function drawStimulusImage(ctx, x, y, width, height, imageId, alpha, params) {
  const image = getStimulusImage(imageId, params);

  ctx.save();
  ctx.globalAlpha = alpha;
  if (image) {
    ctx.drawImage(image, x - width / 2, y - height / 2, width, height);
  }
  ctx.restore();
}

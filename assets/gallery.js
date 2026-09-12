// Shared album-grid + modal image viewer for the Daguerreotypes and Dudus
// plates. Reads /api/media-manifest (built by api/sync-media.js from Angry
// Hosting), renders an album grid into #gallery-root, and opens a <dialog>
// modal with previous/next navigation when an album is chosen. One shared
// file (unlike this site's usual per-page duplication) because this is real
// interactive logic, not boilerplate — a fix here shouldn't need to happen
// twice.
(function () {
  function initGallery(plateKey) {
    var root = document.getElementById('gallery-root');
    if (!root) return;

    fetch('/api/media-manifest')
      .then(function (r) {
        if (!r.ok) throw new Error('manifest fetch failed: ' + r.status);
        return r.json();
      })
      .then(function (manifest) {
        var albums = (manifest.plates && manifest.plates[plateKey]) || [];
        renderGrid(root, albums, manifest.generatedAt);
      })
      .catch(function () {
        renderEmpty(root);
      });
  }

  function renderEmpty(root) {
    root.innerHTML = '<p class="gallery-empty">Photographs are on their way — check back soon.</p>';
  }

  function renderGrid(root, albums, generatedAt) {
    if (albums.length === 0) {
      renderEmpty(root);
      return;
    }

    var grid = document.createElement('div');
    grid.className = 'album-grid';

    albums.forEach(function (album, albumIndex) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'album-card';
      card.setAttribute('aria-label', 'Open album: ' + album.title);

      var thumb = document.createElement('span');
      thumb.className = 'album-thumb';
      var img = document.createElement('img');
      img.src = album.cover;
      img.alt = '';
      img.loading = 'lazy';
      thumb.appendChild(img);

      var title = document.createElement('span');
      title.className = 'album-title';
      title.textContent = album.title;

      var count = document.createElement('span');
      count.className = 'album-count';
      count.textContent = album.images.length + (album.images.length === 1 ? ' photo' : ' photos');

      card.appendChild(thumb);
      card.appendChild(title);
      card.appendChild(count);
      card.addEventListener('click', function () {
        openModal(albums, albumIndex, 0);
      });

      grid.appendChild(card);
    });

    root.innerHTML = '';
    root.appendChild(grid);

    if (generatedAt) {
      var updated = document.createElement('p');
      updated.className = 'gallery-updated';
      updated.textContent = 'Updated ' + formatDate(generatedAt);
      root.appendChild(updated);
    }
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return iso;
    }
  }

  var modal, modalImg, modalCaption;
  var currentAlbums, currentAlbumIndex, currentImageIndex;

  function ensureModal() {
    if (modal) return;

    modal = document.createElement('dialog');
    modal.id = 'gallery-modal';
    modal.innerHTML =
      '<button type="button" class="modal-close" data-gallery-close aria-label="Close">×</button>' +
      '<button type="button" class="gallery-nav gallery-prev" data-gallery-prev aria-label="Previous photo">‹</button>' +
      '<button type="button" class="gallery-nav gallery-next" data-gallery-next aria-label="Next photo">›</button>' +
      '<figure class="gallery-figure">' +
        '<img class="gallery-image" alt="">' +
        '<figcaption class="gallery-caption"></figcaption>' +
      '</figure>';
    document.body.appendChild(modal);

    modalImg = modal.querySelector('.gallery-image');
    modalCaption = modal.querySelector('.gallery-caption');

    modal.querySelector('[data-gallery-close]').addEventListener('click', function () {
      modal.close();
    });
    modal.querySelector('[data-gallery-prev]').addEventListener('click', function () {
      step(-1);
    });
    modal.querySelector('[data-gallery-next]').addEventListener('click', function () {
      step(1);
    });
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.close();
    });
    modal.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        step(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        step(1);
      }
    });
  }

  function step(delta) {
    var images = currentAlbums[currentAlbumIndex].images;
    currentImageIndex = (currentImageIndex + delta + images.length) % images.length;
    renderImage();
  }

  function renderImage() {
    var album = currentAlbums[currentAlbumIndex];
    var image = album.images[currentImageIndex];
    modalImg.src = image.url;
    modalImg.alt = album.title + ' — photo ' + (currentImageIndex + 1) + ' of ' + album.images.length;
    modalCaption.textContent = album.title + ' — ' + (currentImageIndex + 1) + ' / ' + album.images.length;
  }

  function openModal(albums, albumIndex, imageIndex) {
    ensureModal();
    currentAlbums = albums;
    currentAlbumIndex = albumIndex;
    currentImageIndex = imageIndex;
    renderImage();
    modal.showModal();
  }

  window.initGallery = initGallery;
})();

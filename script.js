// ============ CONFIG ============
// Your hotel's WhatsApp number, international format, digits only, no plus sign.
const WHATSAPP_NUMBER = "2349132151022";

function waLink(message){
  return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
}

// Direct WhatsApp CTAs (pickup request, "chat with us", dining orders) work off a
// simple data-wa-message attribute; these are not part of the booking flow.
document.querySelectorAll('[data-wa-message]').forEach(function(el){
  el.setAttribute('href', waLink(el.getAttribute('data-wa-message')));
  el.setAttribute('target', '_blank');
  el.setAttribute('rel', 'noopener noreferrer');
});

// ============ PAGE LOADER ============
const pageLoader = document.getElementById('pageLoader');
if(pageLoader){
  window.addEventListener('load', function(){
    setTimeout(function(){
      pageLoader.classList.add('loader-hidden');
    }, 200);
  });
}

// Branded transition for links to other pages on this site (class="page-link").
// Same-page anchors, external links, wa.me, mailto, and tel links are untouched.
document.querySelectorAll('a.page-link').forEach(function(link){
  link.addEventListener('click', function(e){
    if(e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    const href = link.getAttribute('href');
    if(!href) return;
    e.preventDefault();
    if(pageLoader){
      pageLoader.classList.remove('loader-hidden');
    }
    setTimeout(function(){
      window.location.href = href;
    }, 320);
  });
});

// ============ NAV ACTIVE LINK ============
(function(){
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[href]').forEach(function(a){
    const hrefPage = a.getAttribute('href').split('#')[0] || 'index.html';
    if(hrefPage === currentPage){
      a.classList.add('active');
    }
  });
})();

// ============ ROOM TAB SWITCHING ============
const tabs = document.querySelectorAll('.room-tab');
const panels = document.querySelectorAll('.room-panel');

tabs.forEach(function(tab){
  tab.addEventListener('click', function(){
    const target = tab.getAttribute('data-room');

    tabs.forEach(function(t){
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    panels.forEach(function(p){ p.classList.remove('active'); });
    const targetPanel = document.getElementById('panel-' + target);
    if(targetPanel) targetPanel.classList.add('active');
  });
});

// ============ IMAGE FALLBACK PLACEHOLDER ============
function buildPlaceholder(iconClass){
  const wrap = document.createElement('div');
  wrap.className = 'gallery-placeholder';
  wrap.style.height = '100%';
  wrap.innerHTML = '<i class="fa-solid ' + iconClass + '"></i><span>Photo coming soon</span>';
  return wrap;
}

// ============ FOOTER YEAR ============
const yearEl = document.getElementById('year');
if(yearEl){
  yearEl.textContent = new Date().getFullYear();
}

// ============ NAV MENU TOGGLE ============
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if(navToggle && navLinks){
  navToggle.addEventListener('click', function(){
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ============ BACK TO TOP ============
const backToTop = document.getElementById('backToTop');
if(backToTop){
  window.addEventListener('scroll', function(){
    if(window.scrollY > 600){
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }, { passive: true });
  backToTop.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============ FAQ ACCORDION ============
document.querySelectorAll('.faq-question').forEach(function(btn){
  btn.addEventListener('click', function(){
    const item = btn.parentElement;
    const answer = item.querySelector('.faq-answer');
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.faq-question').forEach(function(b){
      b.setAttribute('aria-expanded', 'false');
      const a = b.parentElement.querySelector('.faq-answer');
      if(a) a.style.maxHeight = null;
    });

    if(!isOpen){
      btn.setAttribute('aria-expanded', 'true');
      if(answer) answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// ============ LIGHTBOX ============
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(src, alt){
  if(!lightboxOverlay || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightboxOverlay.classList.add('open');
  lightboxOverlay.setAttribute('aria-hidden', 'false');
}
function closeLightbox(){
  if(!lightboxOverlay || !lightboxImg) return;
  lightboxOverlay.classList.remove('open');
  lightboxOverlay.setAttribute('aria-hidden', 'true');
  lightboxImg.src = '';
}
if(lightboxOverlay && lightboxImg && lightboxClose){
  document.querySelectorAll('.gallery-item img, .room-media img, .dining-media img').forEach(function(img){
    img.addEventListener('click', function(){
      openLightbox(img.currentSrc || img.src, img.alt);
    });
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxOverlay.addEventListener('click', function(e){
    if(e.target === lightboxOverlay) closeLightbox();
  });
}

// ============ BOOKING MODAL ============
const bookingModal = document.getElementById('bookingModal');
const stepForm = document.getElementById('stepForm');
const stepPay = document.getElementById('stepPay');
const bookingForm = document.getElementById('bookingForm');
const formError = document.getElementById('formError');
const roomTypeSelect = document.getElementById('roomTypeSelect');
const checkinInput = document.getElementById('checkinInput');
const checkoutInput = document.getElementById('checkoutInput');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const payWhatsappBtn = document.getElementById('payWhatsappBtn');
const payLaterBtn = document.getElementById('payLaterBtn');
const modalSummary = document.getElementById('modalSummary');

function todayISO(){
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
}

function openBookingModal(roomValue){
  if(!bookingModal || !stepForm || !stepPay || !bookingForm) return;
  stepForm.hidden = false;
  stepPay.hidden = true;
  bookingForm.reset();
  if(formError) formError.hidden = true;
  if(checkinInput) checkinInput.min = todayISO();
  if(checkoutInput) checkoutInput.min = todayISO();
  if(roomValue && roomTypeSelect){ roomTypeSelect.value = roomValue; }
  bookingModal.classList.add('open');
  bookingModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const firstInput = bookingForm.querySelector('input[name="name"]');
  if(firstInput) firstInput.focus();
}
function closeBookingModal(){
  if(!bookingModal) return;
  bookingModal.classList.remove('open');
  bookingModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('.js-book-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    openBookingModal(btn.getAttribute('data-room') || '');
  });
});

if(bookingModal && checkinInput && checkoutInput){
  checkinInput.min = todayISO();
  checkoutInput.min = todayISO();
  checkinInput.addEventListener('change', function(){
    checkoutInput.min = checkinInput.value;
    if(checkoutInput.value && checkoutInput.value <= checkinInput.value){
      checkoutInput.value = '';
    }
  });
}

if(modalCloseBtn){
  modalCloseBtn.addEventListener('click', closeBookingModal);
}
if(bookingModal){
  bookingModal.addEventListener('click', function(e){
    if(e.target === bookingModal) closeBookingModal();
  });
}
document.addEventListener('keydown', function(e){
  if(e.key !== 'Escape') return;
  if(bookingModal && bookingModal.classList.contains('open')) closeBookingModal();
  if(lightboxOverlay && lightboxOverlay.classList.contains('open')) closeLightbox();
});
if(payLaterBtn){
  payLaterBtn.addEventListener('click', closeBookingModal);
}

function formatDate(iso){
  const d = new Date(iso + 'T00:00:00');
  if(isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}
function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

if(bookingForm){
  bookingForm.addEventListener('submit', function(e){
    e.preventDefault();

    const data = new FormData(bookingForm);
    const name = (data.get('name') || '').trim();
    const phone = (data.get('phone') || '').trim();
    const address = (data.get('address') || '').trim();
    const roomType = data.get('roomType');
    const numRooms = data.get('numRooms');
    const checkin = data.get('checkin');
    const checkout = data.get('checkout');

    if(!name || !phone || !address || !checkin || !checkout){
      if(formError){
        formError.textContent = 'Please fill in every field.';
        formError.hidden = false;
      }
      return;
    }
    if(checkout <= checkin){
      if(formError){
        formError.textContent = 'Check-out date must be after check-in date.';
        formError.hidden = false;
      }
      return;
    }
    if(formError) formError.hidden = true;

    const checkinFmt = formatDate(checkin);
    const checkoutFmt = formatDate(checkout);

    const reservationMsg =
      "Hello Step One Hotel, I would like to make a reservation.\n" +
      "Name: " + name + "\n" +
      "Phone Number: " + phone + "\n" +
      "Address: " + address + "\n" +
      "Room Type: " + roomType + "\n" +
      "Number of Rooms: " + numRooms + "\n" +
      "Check-in Date: " + checkinFmt + "\n" +
      "Check-out Date: " + checkoutFmt;

    window.open(waLink(reservationMsg), '_blank', 'noopener');

    const paymentMsg =
      "Hello Step One Hotel, I would like to make payment for " + numRooms +
      " room(s): " + roomType + ", " + checkinFmt + " to " + checkoutFmt + ".";

    if(payWhatsappBtn){
      payWhatsappBtn.setAttribute('href', waLink(paymentMsg));
      payWhatsappBtn.setAttribute('target', '_blank');
      payWhatsappBtn.setAttribute('rel', 'noopener noreferrer');
    }

    if(modalSummary){
      modalSummary.innerHTML =
        '<strong>' + escapeHtml(name) + '</strong><br>' +
        escapeHtml(roomType) + ' \u00d7 ' + escapeHtml(numRooms) + ' room(s)<br>' +
        escapeHtml(checkinFmt) + ' \u2192 ' + escapeHtml(checkoutFmt);
    }

    stepForm.hidden = true;
    stepPay.hidden = false;
  });
}

// ============ CAREERS / APPLY FOR WORK ============
const careerForm = document.getElementById('careerForm');
const careerFormError = document.getElementById('careerFormError');
const careerStepForm = document.getElementById('careerStepForm');
const careerStepDone = document.getElementById('careerStepDone');
const cvInput = document.getElementById('cvInput');
const cvShareArea = document.getElementById('cvShareArea');
const careerAnotherBtn = document.getElementById('careerAnotherBtn');

if(careerForm){
  careerForm.addEventListener('submit', function(e){
    e.preventDefault();

    const data = new FormData(careerForm);
    const name = (data.get('name') || '').trim();
    const phone = (data.get('phone') || '').trim();
    const address = (data.get('address') || '').trim();
    const position = data.get('position');
    const message = (data.get('message') || '').trim();
    const cvFile = (cvInput && cvInput.files[0]) || null;

    if(!name || !phone || !address){
      if(careerFormError){
        careerFormError.textContent = 'Please fill in your name, phone number, and address.';
        careerFormError.hidden = false;
      }
      return;
    }
    if(careerFormError) careerFormError.hidden = true;

    let applicationMsg =
      "Hello Step One Hotel, I would like to apply for a role with your team.\n" +
      "Name: " + name + "\n" +
      "Phone Number: " + phone + "\n" +
      "Address: " + address + "\n" +
      "Position of Interest: " + position;

    if(message){
      applicationMsg += "\nExperience/Message: " + message;
    }
    if(cvFile){
      applicationMsg += "\n(CV to be shared separately in this chat)";
    }

    window.open(waLink(applicationMsg), '_blank', 'noopener');

    if(cvShareArea){
      cvShareArea.innerHTML = '';
      if(cvFile){
        if(navigator.canShare && navigator.canShare({ files: [cvFile] })){
          const shareBtn = document.createElement('button');
          shareBtn.type = 'button';
          shareBtn.className = 'btn btn-ghost';
          shareBtn.innerHTML = '<i class="fa-solid fa-paperclip"></i> Share Your CV via WhatsApp';
          shareBtn.addEventListener('click', function(){
            navigator.share({
              files: [cvFile],
              title: 'CV - ' + name,
              text: 'CV for Step One Hotel job application (' + name + ')'
            }).catch(function(){});
          });
          cvShareArea.appendChild(shareBtn);
        } else {
          const note = document.createElement('p');
          note.textContent = 'This browser can\'t attach files automatically. Please also attach your CV directly in the WhatsApp chat that just opened.';
          cvShareArea.appendChild(note);
        }
      }
    }

    if(careerStepForm) careerStepForm.hidden = true;
    if(careerStepDone) careerStepDone.hidden = false;
  });
}

if(careerAnotherBtn){
  careerAnotherBtn.addEventListener('click', function(){
    careerForm.reset();
    if(careerFormError) careerFormError.hidden = true;
    if(cvShareArea) cvShareArea.innerHTML = '';
    if(careerStepDone) careerStepDone.hidden = true;
    if(careerStepForm) careerStepForm.hidden = false;
  });
}

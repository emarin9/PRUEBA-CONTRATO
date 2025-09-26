const form = document.getElementById('contractForm');
const steps = Array.from(document.querySelectorAll('.form-step'));
const progressSteps = Array.from(document.querySelectorAll('.progress-step'));
const progressBar = document.getElementById('progressBar');
const summaryContainer = document.getElementById('summary');
const toast = document.getElementById('toast');

let currentStep = 0;

const updateProgress = () => {
  const totalStages = steps.length - 1;
  const safeStep = Math.min(currentStep, totalStages);
  const activeIndex = Math.min(currentStep, progressSteps.length - 1);
  const percent = (safeStep / totalStages) * 100;

  progressBar.style.setProperty('--progress', `${percent}%`);

  progressSteps.forEach((step, index) => {
    const isActive = index === activeIndex && currentStep < totalStages;
    const isComplete = index < safeStep || (currentStep === totalStages && index === activeIndex);
    step.classList.toggle('active', isActive);
    step.classList.toggle('complete', isComplete);
    if (!isActive && !isComplete) {
      step.classList.remove('complete');
    }
  });
};

const showStep = (index) => {
  if (index < 0 || index >= steps.length) {
    return;
  }

  steps[currentStep].classList.remove('active');
  currentStep = index;
  steps[currentStep].classList.add('active');
  updateProgress();
  steps[currentStep].scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const getFormData = () => {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.documentos = formData.getAll('documentos');
  return data;
};

const generateList = (entries) => {
  const list = document.createElement('ul');
  list.className = 'summary__list';

  entries.forEach(([label, value]) => {
    if (!value) return;
    const item = document.createElement('li');
    item.innerHTML = `<strong>${label}:</strong> ${value}`;
    list.appendChild(item);
  });

  return list;
};

const renderSummarySection = (title, entries) => {
  const section = document.createElement('section');
  section.className = 'summary__section';

  const heading = document.createElement('h3');
  heading.textContent = title;
  section.appendChild(heading);
  section.appendChild(generateList(entries));

  return section;
};

const formatCurrency = (value) => {
  if (!value) return '';
  const number = Number(value);
  if (Number.isNaN(number)) return value;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(number);
};

const renderSummary = () => {
  const data = getFormData();
  summaryContainer.innerHTML = '';

  const contractEntries = [
    ['Ciudad de formalización', data.ciudad_formalizacion],
    ['Fecha del contrato', data.fecha_contrato],
    ['Lugar y hora de entrega', [data.lugar_entrega, data.hora_entrega].filter(Boolean).join(' - ')]
  ];

  const sellerEntries = [
    ['Nombre', data.vendedor_nombre],
    ['DNI/NIE', data.vendedor_dni],
    ['Email', data.vendedor_email],
    ['Teléfono', data.vendedor_telefono],
    ['Domicilio', data.vendedor_direccion]
  ];

  const buyerEntries = [
    ['Nombre', data.comprador_nombre],
    ['DNI/NIE', data.comprador_dni],
    ['Email', data.comprador_email],
    ['Teléfono', data.comprador_telefono],
    ['Domicilio', data.comprador_direccion]
  ];

  const documents = data.documentos.length
    ? data.documentos.join(', ')
    : 'Sin documentación marcada.';

  const vehicleEntries = [
    ['Matrícula', data.vehiculo_matricula],
    ['Marca y modelo', [data.vehiculo_marca, data.vehiculo_modelo].filter(Boolean).join(' - ')],
    ['Año', data.vehiculo_anio],
    ['Nº bastidor', data.vehiculo_bastidor],
    ['Kilometraje', data.vehiculo_km ? `${data.vehiculo_km} km` : ''],
    ['Combustible', data.vehiculo_combustible],
    ['ITV vigente hasta', data.vehiculo_itv],
    ['Documentación entregada', documents]
  ];

  const clauses = [];
  if (data.clausula_garantia) {
    clauses.push('El vendedor declara estar al corriente de impuestos, multas y cargas administrativas.');
  }
  if (data.clausula_revision) {
    clauses.push('El comprador reconoce haber probado el vehículo y acepta su estado actual.');
  }
  if (data.clausula_datos) {
    clauses.push('Autorización para el tratamiento de datos personales.');
  }

  const conditionsEntries = [
    ['Precio de venta', formatCurrency(data.precio)],
    ['Señal o depósito', formatCurrency(data.deposito)],
    ['Forma de pago', data.forma_pago],
    ['Fecha prevista de pago', data.fecha_pago],
    ['Observaciones', data.observaciones],
    ['Cláusulas aceptadas', clauses.length ? clauses.join(' · ') : 'Sin cláusulas marcadas.'],
    ['Lugar y fecha de firma', [data.lugar_firma, data.fecha_firma].filter(Boolean).join(', ')]
  ];

  const sections = [
    ['Datos del contrato', contractEntries],
    ['Vendedor', sellerEntries],
    ['Comprador', buyerEntries],
    ['Vehículo', vehicleEntries],
    ['Condiciones económicas', conditionsEntries]
  ];

  sections.forEach(([title, entries]) => {
    summaryContainer.appendChild(renderSummarySection(title, entries));
  });
};

const validateStep = (stepIndex) => {
  const step = steps[stepIndex];
  const inputs = Array.from(step.querySelectorAll('input[required], select[required], textarea[required]'));
  return inputs.every((input) => {
    if (!input.checkValidity()) {
      input.reportValidity();
      return false;
    }
    return true;
  });
};

form.addEventListener('click', (event) => {
  const { target } = event;
  if (!target.matches('[data-action]')) return;

  const action = target.getAttribute('data-action');

  if (action === 'next') {
    if (validateStep(currentStep)) {
      showStep(currentStep + 1);
    }
  }

  if (action === 'prev') {
    showStep(currentStep - 1);
  }

  if (action === 'summary') {
    if (validateStep(currentStep)) {
      renderSummary();
      showStep(steps.length - 1);
    }
  }

  if (action === 'print') {
    window.print();
  }
});

form.addEventListener('input', () => {
  if (currentStep === steps.length - 1) {
    renderSummary();
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  renderSummary();
  showToast('¡Borrador guardado! Puedes imprimirlo o copiar la información.');
});

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
};

updateProgress();

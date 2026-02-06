(function () {
  var listEl = document.getElementById('questionList');
  var emptyState = document.getElementById('emptyState');
  var questionCount = document.getElementById('questionCount');
  var scrollTopFab = document.getElementById('scrollTopFab');

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }

  function parseOption(opt) {
    if (typeof opt === 'string') {
      var m = opt.match(/^([A-Da-d])\b[\.、\s-]*/);
      var key = '';
      var text = opt.trim();
      if (m) {
        key = m[1].toUpperCase();
        text = opt.replace(/^([A-Da-d])\b[\.、\s-]*/, '').trim();
      }
      return { key: key, text: text, raw: opt };
    }
    var keyObj = String(opt && opt.key ? opt.key : '').toUpperCase();
    return { key: keyObj, text: (opt && opt.text) || '', raw: opt };
  }

  function renderQuestion(q, idx) {
    var card = el('div', 'question-card');
    if (q.id) card.id = q.id;

    var header = el('div', 'question-header');
    header.appendChild(el('div', 'question-index', String(idx + 1).padStart(2, '0')));
    var questionText = el('div', 'question-text', '第' + (idx + 1) + '题：' + (q.question || ''));
    header.appendChild(questionText);
    card.appendChild(header);

    var optionsWrap = el('div', 'options');
    var answerKey = String(q.answer || '').trim().toUpperCase();
    var answerText = String(q.answer || '').trim();
    var resultLine = el('div', 'example-result');
    var analysisTitle = el('div', 'example-title', '解析');
    var analysisLine = el('div', 'example-line', q.analysis || '');
    analysisTitle.style.display = 'none';
    analysisLine.style.display = 'none';
    var locked = false;

    (q.options || []).forEach(function (opt) {
      var parsed = parseOption(opt);
      var key = parsed.key;
      var text = parsed.text;
      var btn = el('button', 'option');
      btn.dataset.key = key;
      btn.textContent = (key ? key + '. ' : '') + text;
      btn.addEventListener('click', function () {
        if (locked) return;
        optionsWrap.querySelectorAll('.option').forEach(function (b) {
          b.classList.remove('selected', 'correct', 'wrong');
        });
        btn.classList.add('selected');
        var isAnswerKey = !!answerKey && /^[A-D]$/.test(answerKey);
        var correct = false;
        if (isAnswerKey) {
          correct = key === answerKey;
        } else {
          correct = text === answerText;
        }
        if (correct) {
          btn.classList.add('correct');
          resultLine.textContent = '结果：正确';
          resultLine.className = 'example-result correct';
        } else {
          btn.classList.add('wrong');
          resultLine.textContent = '结果：错误';
          resultLine.className = 'example-result wrong';
        }
        var answerLine = card.querySelector('.example-answer');
        var answerLabel = isAnswerKey ? answerKey : answerText;
        if (!answerLine) {
          answerLine = el('div', 'example-line example-answer', '正确答案：' + answerLabel);
          card.appendChild(answerLine);
        } else {
          answerLine.textContent = '正确答案：' + answerLabel;
        }
        if (q.analysis) {
          analysisTitle.style.display = 'block';
          analysisLine.style.display = 'block';
        }
        locked = true;
        optionsWrap.querySelectorAll('.option').forEach(function (b) {
          b.disabled = true;
          b.classList.add('locked');
        });
      });
      optionsWrap.appendChild(btn);
    });

    card.appendChild(optionsWrap);
    card.appendChild(resultLine);
    if (q.analysis) {
      card.appendChild(analysisTitle);
      card.appendChild(analysisLine);
    }
    return card;
  }

  function renderQuestions(list) {
    if (!Array.isArray(list)) list = [];
    if (questionCount) questionCount.textContent = '题目数：' + list.length;
    listEl.innerHTML = '';
    if (!list.length) {
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';
    var frag = document.createDocumentFragment();
    list.forEach(function (q, idx) { frag.appendChild(renderQuestion(q, idx)); });
    listEl.appendChild(frag);
  }

  function loadData() {
    fetch('data.json', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) { renderQuestions(data); })
      .catch(function () {
        if (emptyState) {
          emptyState.style.display = 'block';
          emptyState.textContent = '数据加载失败';
        }
      });
  }

  if (scrollTopFab) {
    scrollTopFab.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', function () {
      if (window.scrollY > 200) {
        scrollTopFab.classList.add('show');
      } else {
        scrollTopFab.classList.remove('show');
      }
    });
  }

  loadData();
})();

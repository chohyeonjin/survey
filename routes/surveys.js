var express = require('express'),
    Survey = require('../models/Survey');
    Question = require('../models/Question');
var router = express.Router();

// 원하는 정보가 모두 들어왔나를 확인하는 함수
function validateForm(form, options) {
  var email = form.email || "";
  var title = form.title || "";
  email = email.trim();

  if(!email){
    return '이메일을 입력해주세요.';
  }
  if (!form.password && options.needPassword) {
    return '비밀번호를 입력해주세요.';
  }

  if (form.password.length < 6) {
    return '비밀번호는 6글자 이상이어야 합니다.';
  }

  return null;
}


router.get('/',function(req, res, next) {
  Survey.find({}, function(err, surveys) {
    if (err) {
      return next(err);
    }
    res.render('surveys/index', {surveys: surveys});
  });
});


router.get('/new', function(req, res, next) {
  res.render('surveys/edit',{survey: 0});
});

router.get('/:id/questions/new', function(req, res, next) {
  res.render('surveys/questions/edit',{question: 0});
});


router.get('/:id', function(req, res, next) {
  Question.find({},function(err, questions) {
    if (err) {
      return next(err);
    }
    Survey.findById(req.params.id, function(err, survey) {
      if (err) {
        return next(err);
      }
      if(survey) {
        survey.read = survey.read + 1;
        survey.save(function(err) { });
      }
    res.render('surveys/questions/index', {questions : questions});
  });
});
});

//글 수정을 눌렀을 때
router.get('/:id/edit', function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    res.render('surveys/edit', {survey : survey});
  });
});

// 글 수정할때
router.put('/:id', function(req, res, next) {
  var err = validateForm(req.body);

  if (err) {
    return res.redirect('back');
  }
//게시글 id 에 대한 수행
  Survey.findById({_id: req.params.id}, function(err, surveys) {
    if (err) {
      return next(err);
    }
    // 게시글이 없을 경우 go back
    if (!surveys) {
      return res.redirect('back');
    }
    //글 수정 시 비밀번호 일치 여부를 확인
    if (surveys.password !== req.body.password) {
      return res.redirect('back');
    }

    surveys.title = req.body.title;
    surveys.email = req.body.email;
    surveys.content = req.body.content;

//변경 내용 저장
    surveys.save(function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/surveys');
    });
  });
});

//게시글을 삭제할 때
router.delete('/:id', function(req, res, next) {
  Survey.findOneAndRemove({_id: req.params.id}, function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/surveys');
  });
});

// id에 해당하는 게시글을 보여주는 함수
// router.get('/:id', function(req, res, next) {
//   Survey.findById(req.params.id, function(err, survey) {
//     if (err) {
//       return next(err);
//     }
//     if (survey) {
//       survey.read = survey.read + 1;
//       survey.save(function(err) { });
//       res.render('surveys/questions/index', {survey: survey});
//     }
//     return next(new Error('not found'));
//   });
// });

//글 쓰기 수행
router.post('/', function(req, res, next) {
  var err = validateForm(req.body, {needPassword: true});

  if(err){
    return res.redirect('back');
  }

//에러 없을 시 새로운 게시글 생성
  var newSurvey = new Survey({
      email: req.body.email,
      title : req.body.title,
      content : req.body.content,
      password : req.body.password
    }); //필요한 내용을 입력

    newSurvey.save(function(err,doc){
      if(err){
        return next(err);
      } else {
        res.redirect('/surveys/' + doc.id);
      }
    });
  });



module.exports = router;

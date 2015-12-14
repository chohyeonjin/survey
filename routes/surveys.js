var express = require('express'),
    Survey = require('../models/Survey');
    Question = require('../models/Question');
    Answer = require('../models/Answer');
var router = express.Router();

function needAuth(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.flash('danger', '로그인이 필요합니다.');
      res.redirect('/signin');
    }
}
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

//설문 리스트 띄우기
router.get('/',needAuth,function(req, res, next) {
  Survey.find({}, function(err, surveys) {
    if (err) {
      return next(err);
    }
    res.render('surveys/index', {login: req.session.user , surveys: surveys});
  });
});


//새 설문 띄우기
router.get('/new', function(req, res, next) {
  res.render('surveys/edit',{survey: 0, login : req.session.user });
});

//설문 안의 질문 페이지 추가 띄우기
router.get('/:id/questions/new', function(req, res, next) {
  Question.find({},function(err, questions) {
    if (err) {
      return next(err);
    }
    Survey.findById(req.params.id, function(err, survey) {
      if (err) {
        return next(err);
      }

      if(survey) { //조회수 증가


        survey.read = survey.read + 1;
        survey.save(function(err) { });
      }
    res.render('surveys/questions/edit', {questions : 0 , survey : survey});
  });
});
});

//해당 설문으로 들어갈 때
router.get('/:id', function(req, res, next) {

    Survey.findById(req.params.id, function(err, survey) {
      if (err) {
        return next(err);
      }
      if(survey) {
        survey.read = survey.read + 1;
        survey.save(function(err) { });
      }
      Question.find({sId:req.params.id},function(err,questions){
        if(err){
          return next(err);
        }
        res.render('surveys/questions/index', {questions : questions , survey : survey , login : req.session.user});
      });
    });
  });



//질문 내용 보기

  router.get('/:id/:qid/answer', function(req, res, next) {

      Survey.findById(req.params.id, function(err, survey) {
        if (err) {
          return next(err);
        }
        Question.findById(req.params.qid,function(err,question){
          if(err){
            return next(err);
          }
          if (req.session.user.type == 'super'){
            res.render('surveys/questions/show', {question : question , survey : survey , login : req.session.user});
          }
          else {
            res.render('surveys/answers/edit' , {question : question , survey : survey , login : req.session.user });
          }
        });
      });
    });

//관리자 입장에서 응답 결과를 본다
  router.get('/:id/:qid/result', function(req,res,next){
    Survey.findById(req.params.id, function(err,survey){
      if (err){
        return next(err);
      }
      Question.findById(req.params.qid, function(err,question){
        if(err) {
          return next(err);
        }
        Answer.find({qId : req.params.qid},function(err,answers){
          if(err){
            return next(err);
          }
          res.render('surveys/answers/show',  { question : question , survey : survey , login : req.session.user , answers:answers });
        });
      });
    });
  });

//설문 수정을 눌렀을 때
router.get('/:id/edit', function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    res.render('surveys/edit', {survey : survey});
  });
});

//설문안의 질문을 수정한다
router.get('/:id/:qid/alter',function(req,res,next){

  Survey.findById(req.params.id, function(err,survey){
    if(err) {
      return next(err);
    }
    Question.findById(req.params.qid,function(err,question){
      if(err){
        return next(err);
      }
      res.render('surveys/questions/alter', {question : question, survey : survey});
    });
  });
});

// 설문 수정할때
router.put('/:id', function(req, res, next) {

  Survey.findById({_id: req.params.id}, function(err, surveys) {
    if (err) {
      return next(err);
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

//설문 안의 질문 수정
router.post('/:id/:qid/alter', function(req, res, next) {
  Question.findById({_id: req.params.qid}, function(err, question) {
    if (err) {
      return next(err);
    }
    else {
      question.sId = req.params.id;
      question.title = req.body.title;
      question.content = req.body.content;
    }
//변경 내용 저장
    question.save(function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/surveys/'+ req.params.id);
    });
  });
});


//설문을 삭제할 때
router.delete('/:id', function(req, res, next) {
  Survey.findOneAndRemove({_id: req.params.id}, function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/surveys');
  });
});

//질문을 삭제할 때
router.delete('/:id/:qid', function(req, res, next) {
  Question.findOneAndRemove({_id: req.params.qid}, function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/surveys/'+ req.params.id);
  });
});


//글 쓰기 수행

router.post('/', function(req, res, next) {

//에러 없을 시 새로운 게시글 생성
  var newSurvey = new Survey({
      email: req.body.email,
      title : req.body.title,
      content : req.body.content,
    }); //필요한 내용을 입력

    newSurvey.save(function(err,doc){
      if(err){
        return next(err);
      } else {
        res.redirect('/surveys');
      }
    });
  });


//설문 안의 질문 쓰기
  router.post('/:id/questions', function(req, res, next) {


  //에러 없을 시 새로운 게시글 생성
    var newQuestion = new Question({
        sId : req.params.id,
        title : req.body.title,
        content : req.body.content
      }); //필요한 내용을 입력

      newQuestion.save(function(err, doc){
        if(err){
          return next(err);
        }

        res.redirect('/surveys/' + req.params.id);

      });
    });

  //설문 안의 응답 쓰기
  router.post('/:id/:qid/answer',function(req,res,next){

    var newAnswer = new Answer({
      qId : req.params.qid,
      ansBy : req.session.user.name,
      ansRes : req.body.ansres,
    });

    newAnswer.save(function(err,doc){
      if(err){
        return next(err);
      }

      res.redirect('/surveys/'+ req.params.id);
    });
  });

module.exports = router;

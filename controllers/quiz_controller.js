var models = require('../models/models.js');

exports.ownershipRequired = function(req,res,next){
	var objQuizOwner = req.quiz.UserId;
	var logUser = req.session.user.id;
	var isAdmin = req.session.user.isAdmin;

	if(isAdmin ||objQuizOwner === logUser){
		next();
	}else{
		res.redirect('/');
	}
};


// LOAD
exports.load = function(req,res,next,quizId) {
	models.Quiz.find({
		where: {id: Number(quizId)},
		include: [{model: models.Comment}]
	}).then(
			function(quiz) {
				if(quiz){
					req.quiz=quiz; 	next();
				}else{ next(new Error('No existe quizId=' + quizId)); }
			}).catch(function(error){next(error);});
};


// GET /quizes
exports.index = function(req,res){
	
	if (req.query.search == undefined){
		models.Quiz.findAll().then(function(quizes){
			res.render('quizes/index.ejs',{quizes: quizes, errors:[]});
		});
	}else{
			
		console.log(req.query.search);
		var search= '%' +(String(req.query.search)).replace(/\s/g,"%")+'%';
		models.Quiz.findAll({where: ["pregunta like ?",search], order: ['pregunta']}).then(function(quizes){
			res.render('quizes/index.ejs',{quizes: quizes,errors:[]});
		}).catch(function(error){next(error);});
	}
};

// GET /quiz/:id
exports.show = function (req,res){
	models.Quiz.find(req.params.quizId).then(function(quiz){
		res.render('quizes/show',{quiz: req.quiz, errors:[]});})	
	
};

// GET /quizes/:id/answer
exports.answer = function(req,res){
	var resultado = 'Incorrecto';
	models.Quiz.find(req.params.quizId).then(function(quiz){
		if (req.query.respuesta === req.quiz.respuesta){
			resultado = 'Correcto';
		}
			res.render('quizes/answer',
				{quiz: quiz,respuesta: resultado, errors:[]});
		
	})
};


// GET /quizes/new
exports.new = function (req,res) {
	var quiz = models.Quiz.build(
		{pregunta: "Pregunta", respuesta: "Respuesta"});
	res.render('quizes/new', {quiz: quiz, errors: []});
};


//POST /quizes/create
exports.create = function(req,res) {
	req.body.quiz.UserId = req.session.user.id;
	var quiz = models.Quiz.build(req.body.quiz);
	quiz.validate().then(
		function(err){
		if (err) {
			res.render('quizes/new', {quiz:quiz, errors:err.errors});

		} else {
			quiz.save({fields: ['pregunta','respuesta','UserId']})
			.then(function(){res.redirect('/quizes')})}
		
	}).catch(function(error){next(error)});
};

exports.edit = function(req,res) {
	var quiz = req.quiz;
	res.render('quizes/edit', {quiz: quiz, errors: []});
};

exports.update = function(req,res) {
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;

	req.quiz.validate().then(
		function(err){
		if (err) {
			res.render('quizes/edit', {quiz:req.quiz, errors:err.errors});

		} else {
			req.quiz.save({fields: ["pregunta","respuesta"]})
			.then(function(){res.redirect('/quizes')})}
		
	});
};
exports.destroy = function(req,res){
	req.quiz.destroy()
	.then(function(){res.redirect('/quizes');
	}).catch(function(error){next(error);});

	};



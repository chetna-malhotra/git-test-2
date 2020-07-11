const mongoose=require('mongoose');
const Dishes=require('./models/dishes');
const url='mongodb://localhost:27017/confusion';
const connect=mongoose.connect(url);
connect.then((db)=>{
	console.log('Connected correctly');

	Dishes.create({
		name:'Burgerizza',
		description:'MINEEE'
	})
	.then((dish)=>{
		console.log(dish);
		return Dishes.findByIdAndUpdate(dish._id,{
			$set:{description:'Updated test'}
		},
			{new:true}
		).exec();
	})
	.then((dish)=>{
		console.log(dish);
		dish.comments.push({
			rating:5,
			comment:"Very good food ",
			author:"ME"
		});
		return dish.save();
	}).then((dish)=>{

		console.log(dish);
		return Dishes.remove();
	
	})
	.then(()=>{
		return mongoose.close();
	})
	.catch((err)=>{console.log(err)});
});

const mongoose=require('mongoose');
const Dishes=require('./models/dishes');
const url='mongodb://localhost:27017/confusion';
const connect=mongoose.connect(url);
connect.then((db)=>{
	console.log('Connected correctly');
	var newDish=Dishes({
		name:'Burgerizza',
		description:'MINEEE'
	});

	newDish.save()
	.then((dish)=>{
		console.log(dish);
		return Dishes.find({}).exec();
	})
	.then((dishes)=>{
	console.log(dishes);
	return Dishes.remove();
	})
	.then(()=>{
	return mongoose.close();
	})
	.catch((err)=>{console.log(err)});
});

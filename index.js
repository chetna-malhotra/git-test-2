var rect={
perimeter:(x,y)=>(2*(x+y)),
area:(x,y)=>(x*y)
};
function solveRect(l,b){
	console.log("solving for rect with l="+l+"and b= "+b);
	if(l<=0 || b<=0){
		console.log("Dimension should be >0");
	}
	else{
		console.log("Area of rect is :"+rect.area(l,b));
		console.log("perimeter of rect is :"+rect.perimeter(l,b));
	}
}

solveRect(2,4);
solveRect(3,5);
solveRect(0,5);
solveRect(-3,5);

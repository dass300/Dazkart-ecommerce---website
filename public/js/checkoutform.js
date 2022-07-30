$("#checkout-form").submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/place-order',
        method:'post',
        data:$('#checkout-form').serialize(),
        success:(response)=>{
            alert(response)
            if(response.codSuccess){
                location.href='/order-success'
            }else{
                razorpayPayment(response)

            }
        }
    })
})

function razorpayPayment(order){
    var options = {
"key": "rzp_test_q5czRlZZnbd9ck", // Enter the Key ID generated from the Dashboard
"amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
"currency": "USD",
"name": "DazKart",
"description": "Test Transaction",
"image": "https://example.com/your_logo",
"order_id": "order_9A33XWu170gUtm", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
"callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
"handler":function(response){
varifyPayment(response,order)
},
"prefill": {
"name": "Gaurav Kumar",
"email": "gaurav.kumar@example.com",
"contact": "9999999999"
},
"notes": {
"address": "Razorpay Corporate Office"
},
"theme": {
"color": "#3399cc"
}
};
var rzp1 = new Razorpay(options);
rzp1.open();
}


function verifyPayment(paayment,order){
    $.ajax({
        url:'/verify-payment',
        data:{
            payment,
            order
        },
        method:'post',
        success:(response)=>{
             if(response.status){
                location.href='/order-success'


             }else{
                alert("Payment failed")
             }
        }
    })  
}
function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count= $('#cart-count').html()
                count=parseInt(count)+1
                $("#cart-count").html(count)
            }
            alert('Are you sure want to add this product to your cart?')
        }
    })
}
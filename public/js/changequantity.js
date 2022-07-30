function changeQuantity(cartId,proId,userId,count){
    let quantity=parseInt(document.getElementById(proId).innerHTML)
    count=parseInt(count)

    $.ajax({
        url:'/change-product-quantity',
        data:{
            user:userId,
            cart:cartId,
            product:proId,
            count:count,
            quantity:quantity
        },
        method:'post',
        success:(response)=>{
            if(response.removeProduct){
                alert('Product Removed from Cart')
                location.reload()

            }else{
                document.getElementById(proId).innerHTML=quantity+count
                document.getElementById('total').innerHTML=response.total
            }
        }
    })
}


function removeProduct(cartId,proId,userId) {
    let quantity = parseInt(document.getElementById(proId).innerHTML)
    $.ajax({
        url: '/remove-product',
        data: {
          user:userId,
            cart: cartId,
            product: proId,
            quantity: quantity
        },
        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                alert("Product removed from cart")
                location.reload()
            } else {
            }
        }
    })
  }

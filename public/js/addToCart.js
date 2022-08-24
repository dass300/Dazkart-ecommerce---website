function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                // let count= $('#cart-count').html()
                let count= document.getElementById('cart-count').value
                count=parseInt(count) + 1
                console.log(count);
                document.getElementById('cart-count').value = count
                document.getElementById('cart-counts').innerHTML = count
                // $("#cart-count").html(count)
            }
            // alert('Are you sure want to add this product to your cart?')
            
            swal("", "Product has been added in your cart", "success");
        }
    })
}
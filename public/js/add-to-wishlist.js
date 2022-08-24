function addToWishlist(proId){
   
        $.ajax({
            url:'/add-to-wishlist/'+proId,
            method:'get',
            success:(response)=>{
                if(response.status){
                    // let count= $('#cart-count').html()
                    let count= document.getElementById('wishlist-count').value
                    count=parseInt(count) + 1
                    console.log(count);
                    document.getElementById('wishlist-count').value = count
                    document.getElementById('wishlist-counts').innerHTML = count
                    // $("#cart-count").html(count)
                }
                // alert('Are you sure want to add this product to your cart?')
                
                swal("", "Product has been added in your wishlist", "success");
            }
        })
    }
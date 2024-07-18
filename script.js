document.addEventListener('DOMContentLoaded', () => {
    let db;
    const request = indexedDB.open('shoppingCartDB', 1);

    request.onerror = (event) => {
        console.error('Database error:', event.target.error);
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        console.log('Database opened succesfully');
        loadCartData();
    };

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        const objectStore = db.createObjectStore('cart', {keyPath: 'id', autoIncrement: true});
        objectStore.createIndex('name', 'name', {unique:false});
        objectStore.createIndex('price', 'price', {unique:false});
        objectStore.createIndex('quantity','quantity', {unique:false});
        objectStore.createIndex('total','total',{unique:false});
        objectStore.createIndex('shipping', 'shipping', {unique:false});
    };

    function loadCartData() {
        const transaction = db.transaction(['cart'],'readonly');
        const objectStore = transaction.objectStore('cart');
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            const cartItems = event.target.result;
            renderCartItems(cartItems);
        };
    }

    function renderCartItems(cartItems) {
        const cartContainer = document.querySelector('.returnCart');
        cartContainer.innerHTML = '';

        cartItems.foreach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('list');
            cartItem.innerHTML = `
            <div class="item">
                <img src="${item.image}" alt="">
                <div class="info">
                    <div class="name">${item.name}</div>
                    <div class="price">${item.description}</div>
                </div>
                <div class="quantity">${item.quantity}</div>
                <div class="returnPrice">${item.price}</div>
                <i class="trashcan" onclick="removeItem(${item.id})><img src="pic/Trash Can.png" alt=""></i>
                </div>
            `;
            cartContainer.appendChild(cartItem);     
        });

        updateTotals(cartItems);
    }

    function updateTotals(cartItems) {
        const subtotal = cart.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const shipping = 4;
        const total = subtotal + shipping;

        document.querySelector('.summary').innerHTML = `
        <div>
            <p>Subtotal</p>
            <p>$${subtotal}</p>
        </div>
        <div>
            <p>Shipping</p>
            <p>$${shipping}</p>
        </div>
        <div>
            <p>Total (Tax incl.)</p>
            <p>$${total}</p>
        </div>
    `;
    }

    function removeItem(id) {
        const transaction = db.transaction(['cart'], 'readwrite');
        const objectStore = transaction.objectStore('cart');
        objectStore.delete(id);

        transaction.oncomplete = () => {
            console.log('Item removed');
            loadCartData();
        };
    }

    document.querySelector('.buttonCheckout').addEventListener('click', () => {
        const transaction = db.transaction(['orders'], 'readwrite');
        const objectStore = transaction.objectStore('orders');
        const request = objectStore.add({
            items: cartItems,
            subtotal:subtotal,
            shipping: shipping,
            total:total,
            date: new Date()
        });

        request.onsuccess = () => {
            console.log('Order saved');
            clearCart();
        };
    });


    function clearCart() {
        const transaction = db.transaction(['cart'], 'readwrite');
        const objectStore = transaction.objectStore('cart');
        objectStore.clear();

        transaction.oncomplete = () => {
            console.log('Cart cleared');
            loadCartData();
        };
    }
});

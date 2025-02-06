import { useEffect, useRef, useState } from 'react'
import axios, { Axios } from 'axios'
import { Modal } from 'bootstrap';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

const defaultModalState = {
  imageUrl: "",
  title: "",
  category: "",
  unit: "",
  origin_price: "",
  price: "",
  description: "",
  content: "",
  is_enabled: 0,
  imagesUrl: [""]
};

function App() {
  const [isContent, setIsContent] = useState(false);

  const [products, setProducts] = useState([]);

  const [account, setAccount] = useState({
    username: "example@test.com",
    password: "example"
  });

  const handleInputChange = (e) => {
    // console.log(e.target.value);
    const { value, name } = e.target;

    setAccount({
      ...account,
      [name]: value
    })
  };

  const getProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/v2/api/${API_PATH}/admin/products`);
      setProducts(res.data.products)
    } catch (error) {
      alert('取得產品失敗');
    }
  };

  const login = async (e) => {
    e.preventDefault();
    // console.log(account)
    try {
      const res = await axios.post(`${BASE_URL}/v2/admin/signin`, account);
      const { token, expired } = res.data;
      document.cookie = `itToken=${token}; expires=${new Date(expired)}`;
      axios.defaults.headers.common['Authorization'] = token;

      setIsContent(true);
      getProducts();
    } catch (error) {
      alert('登入失敗')
    }
  };

  const checkUserLogin = async () => {
    try {
      await axios.post(`${BASE_URL}/v2/api/user/check`);
      getProducts();
      setIsContent(true);
    } catch (error) {
      console.error('error');
    }
  };

  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)itToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1",
    );
    axios.defaults.headers.common['Authorization'] = token;
    checkUserLogin();
  }, [])

  const productModalRef = useRef(null);
  const delProductModalRef = useRef(null);
  const [modalMode, setModalMode] = useState(null);

  useEffect(() => {
    new Modal(productModalRef.current, { backdrop: false });

    new Modal(delProductModalRef.current, { backdrop: false });
  }, [])

  const handleOpenProductModal = (mode, product) => {
    setModalMode(mode);

    if (mode === 'create') {
      setSelectedProduct(defaultModalState);
    } else {
      setSelectedProduct({
        ...product,
        imagesUrl: product.imagesUrl || [""],
      });
    }

    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.show();
  }

  const handleCloseProductModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.hide();
  }

  const handleOpenDelProductModal = (product) => {
    setSelectedProduct(product);
    const modalInstance = Modal.getInstance(delProductModalRef.current);
    modalInstance.show();
  }

  const handleCloseDelProductModal = () => {
    const modalInstance = Modal.getInstance(delProductModalRef.current);
    modalInstance.hide();
  }

  const [selectedProduct, setSelectedProduct] = useState(defaultModalState);

  const handleModalInputChange = (e) => {
    const { value, name, type, checked } = e.target;

    setSelectedProduct({
      ...selectedProduct,
      [name]: type === "checkbox" ? checked : value
    })
  }

  const handleImageChange = (e, index) => {
    const { value } = e.target;

    const newImages = [...selectedProduct.imagesUrl];
    newImages[index] = value;

    setSelectedProduct({
      ...selectedProduct,
      imagesUrl: newImages
    })
  }

  const handleAddImage = () => {
    const newImages = [...selectedProduct.imagesUrl, ''];

    setSelectedProduct({
      ...selectedProduct,
      imagesUrl: newImages
    })
  }

  const handleRemoveImage = () => {
    const newImages = [...selectedProduct.imagesUrl];

    newImages.pop();

    setSelectedProduct({
      ...selectedProduct,
      imagesUrl: newImages
    })
  }

  const createProduct = async () => {
    try {
      await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/product`, { data: { ...selectedProduct, origin_price: Number(selectedProduct.origin_price), price: Number(selectedProduct.price), is_enabled: selectedProduct.is_enabled ? 1 : 0 } });
      getProducts();
      setIsContent(true);
    } catch (error) {
      alert('新增產品失敗');
    }
  }

  const updateProduct = async () => {
    try {
      await axios.put(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${selectedProduct.id}`, { data: { ...selectedProduct, origin_price: Number(selectedProduct.origin_price), price: Number(selectedProduct.price), is_enabled: selectedProduct.is_enabled ? 1 : 0 } });
      getProducts();
      setIsContent(true);
    } catch (error) {
      alert('編輯產品失敗');
    }
  }

  const delProduct = async () => {
    try {
      await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${selectedProduct.id}`, { data: { ...selectedProduct, origin_price: Number(selectedProduct.origin_price), price: Number(selectedProduct.price), is_enabled: selectedProduct.is_enabled ? 1 : 0 } });
      getProducts();
      setIsContent(true);
    } catch (error) {
      alert('刪除產品失敗');
    }
  }

  const handleUpdateProduct = async () => {
    const apiCall = modalMode === 'create' ? createProduct : updateProduct;

    try {
      await apiCall();
      getProducts();
      handleCloseProductModal();
    } catch (error) {
      alert('更新產品失敗')
    }
  }

  const handleDelProduct = async () => {
    try {
      await delProduct();

      getProducts();
      handleCloseDelProductModal();
    } catch (error) {
      alert('刪除產品失敗');      
    }
  }

  return (
    <>
      {
        isContent ?
          (<div className="container">
            <div className="row mt-5">
              <div className="col">
                <div className='d-flex justify-content-between'>
                  <h2 className="fw-bolder">產品列表</h2>
                  <button onClick={() => handleOpenProductModal('create')} type="button" className='btn btn-success btn-sm'>建立新的產品</button>
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">產品名稱</th>
                      <th scope="col">原價</th>
                      <th scope="col">售價</th>
                      <th scope="col">是否啟用</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="align-middle">
                        <th scope="row">{product.title}</th>
                        <td>{product.origin_price}</td>
                        <td>{product.price}</td>
                        <td>{product.is_enabled ? <span className="text-success">啟用</span> : <span>未啟用</span> }</td>
                        <td>
                          {/* <button type="button" className="btn btn-primary" onClick={() => { setProducts(product) }}>查看詳細資訊</button> */}
                          <div className="btn-group">
                            <button onClick={() => handleOpenProductModal('edit', product)} type="button" className="btn btn-outline-primary btn-sm">編輯</button>
                            <button onClick={() => handleOpenDelProductModal(product)} type="button" className="btn btn-outline-danger btn-sm">刪除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>)
          :
          <div className="d-flex flex-column justify-content-center align-items-center vh-100">
            <h1 className="mb-3">登入頁面</h1>
            <form onSubmit={login} className="d-flex flex-column gap-3">
              <div className="form-floating mb-3">
                <input name='username' value={account.username} onChange={handleInputChange} type="email" className="form-control" id="username" placeholder="name@example.com" />
                <label htmlFor="username">Email address</label>
              </div>
              <div className="form-floating">
                <input name='password' value={account.password} onChange={handleInputChange} type="password" className="form-control" id="password" placeholder="Password" />
                <label htmlFor="password">Password</label>
              </div>
              <button className="btn btn-primary">登入</button>
            </form>
          </div>
      }

      <div ref={productModalRef} id="productModal" className="modal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fs-4">{modalMode === 'create' ? '新增產品' : '編輯產品'}</h5>
              <button onClick={handleCloseProductModal} type="button" className="btn-close" aria-label="Close"></button>
            </div>

            <div className="modal-body p-4">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="mb-4">
                    <label htmlFor="primary-image" className="form-label">
                      主圖
                    </label>
                    <div className="input-group">
                      <input
                        value={selectedProduct.imageUrl}
                        onChange={handleModalInputChange}
                        name="imageUrl"
                        type="text"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                      />
                    </div>
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.title}
                      className="img-fluid"
                    />
                  </div>

                  {/* 副圖 */}
                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {selectedProduct.imagesUrl?.map((image, index) => (
                      <div key={index} className="mb-2">
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          value={image}
                          onChange={(e) => handleImageChange(e, index)}
                          id={`imagesUrl-${index + 1}`}
                          type="text"
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                        />
                        {image && (
                          <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-fluid mb-2"
                          />
                        )}
                      </div>
                    ))}
                    <div className="btn-group w-100">
                      {selectedProduct.imagesUrl.length < 5 && selectedProduct.imagesUrl[selectedProduct.imagesUrl.length - 1] !== '' && (
                        <button onClick={handleAddImage} className="btn btn-outline-primary btn-sm w-100">新增圖片</button>
                      )}
                      {selectedProduct.imagesUrl.length > 1 && (
                        <button onClick={handleRemoveImage} className="btn btn-outline-danger btn-sm w-100">取消圖片</button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      value={selectedProduct.title}
                      onChange={handleModalInputChange}
                      name="title"
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      分類
                    </label>
                    <input
                      value={selectedProduct.category}
                      onChange={handleModalInputChange}
                      name="category"
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">
                      單位
                    </label>
                    <input
                      value={selectedProduct.unit}
                      onChange={handleModalInputChange}
                      name="unit"
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        value={selectedProduct.origin_price}
                        onChange={handleModalInputChange}
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入原價"
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        value={selectedProduct.price}
                        onChange={handleModalInputChange}
                        name="price"
                        id="price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入售價"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      value={selectedProduct.description}
                      onChange={handleModalInputChange}
                      name="description"
                      id="description"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入產品描述"
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      value={selectedProduct.content}
                      onChange={handleModalInputChange}
                      name="content"
                      id="content"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入說明內容"
                    ></textarea>
                  </div>

                  <div className="form-check">
                    <input
                      checked={selectedProduct.is_enabled}
                      onChange={handleModalInputChange}
                      name="is_enabled"
                      type="checkbox"
                      className="form-check-input"
                      id="isEnabled"
                    />
                    <label className="form-check-label" htmlFor="isEnabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light">
              <button onClick={handleCloseProductModal} type="button" className="btn btn-secondary">
                取消
              </button>
              <button onClick={handleUpdateProduct} type="button" className="btn btn-primary">
                確認
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={delProductModalRef}
        className="modal fade"
        id="delProductModal"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                onClick={handleCloseDelProductModal}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除
              <span className="text-danger fw-bold">{selectedProduct.title}</span>
            </div>
            <div className="modal-footer">
              <button
                onClick={handleCloseDelProductModal}
                type="button"
                className="btn btn-secondary"
              >
                取消
              </button>
              <button onClick={handleDelProduct} type="button" className="btn btn-danger">
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App

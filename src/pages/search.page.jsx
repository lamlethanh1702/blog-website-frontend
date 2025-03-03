import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";
import UserCard from "../components/usercard.component";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { activeTabRef } from "../components/inpage-navigation.component";

const posts = [
  {
    title:
      "Some quick example text to build on the card title and make up the bulk of the card’s content",
    date: "July 1, 2024",
    readingTime: "3 minutes",
    imgSrc: "/img/meo1.jpg",
  },
  {
    title:
      "Some quick example text to build on the card title and make up the bulk of the card’s content",
    date: "July 1, 2024",
    readingTime: "3 minutes",
    imgSrc: "https://via.placeholder.com/300x200",
  },
  {
    title:
      "Some quick example text to build on the card title and make up the bulk of the card’s content",
    date: "July 1, 2024",
    readingTime: "3 minutes",
    imgSrc: "https://via.placeholder.com/300x200",
  },
];

const SearchPage = () => {
  let { query } = useParams();
  let [pageState, setPageState] = useState("home");
  let [trendingBlogs, setTrendingBlog] = useState(null);
  let [blogs, setBlog] = useState(null);
  let [users, setUsers] = useState(null);
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const [categories, setAllCategories] = useState([]);

  const loadBlogByCategory = (e) => {
    let category = e.target.innerText.toLowerCase();

    setBlog(null);

    if (pageState == category) {
      setPageState("home");
      return;
    }

    setPageState(category);
  };

  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
      .then(({ data }) => {
        setTrendingBlog(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchLatestBlogs = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/all-latest-blogs-count",
        });

        setBlog(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    activeTabRef.current.click();

    if (pageState == "home") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogsByCategory({ page: 1 });
    }

    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState]);

  const isCategoriesSet = useRef(false);
  useEffect(() => {
    if (
      blogs?.results &&
      blogs.results.length > 0 &&
      !isCategoriesSet.current
    ) {
      let uniqueCategories = Array.from(
        new Set(blogs.results.flatMap((blog) => blog.tags)) // Loại bỏ trùng lặp
      ).sort((a, b) => a.localeCompare(b, "en", { numeric: true })); // Sắp xếp theo chữ + số

      setAllCategories(uniqueCategories);
      isCategoriesSet.current = true; // Đánh dấu rằng categories đã được thiết lập
    }
  }, [blogs]);

  const handleSearch = (e) => {
    let query = e.target.value;

    if (e.keyCode == 13 && query.length) {
      navigate(`/search/${query}`);
    }
  };
  let navigate = useNavigate();
  const searchBlogs = ({ page = 1, create_new_arr = false }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        query,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { query },
          create_new_arr,
        });

        setBlog(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchUsers = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", { query })
      .then(({ data: { users } }) => {
        setUsers(users);
      });
  };

  useEffect(() => {
    resetState();
    searchBlogs({ page: 1, create_new_arr: true });
    fetchUsers();
  }, [query]);

  const resetState = () => {
    setBlog(null);
    setUsers(null);
  };

  const UserCardWrapper = () => {
    return (
      <>
        {users == null ? (
          <Loader />
        ) : users.length ? (
          users.map((user, i) => {
            return (
              <AnimationWrapper
                key={i}
                transition={{ duration: 1, delay: i * 0.08 }}
              >
                <UserCard user={user} />
              </AnimationWrapper>
            );
          })
        ) : (
          <NoDataMessage message="No user found" />
        )}
      </>
    );
  };

  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InPageNavigation
          routes={[`Search Results from "${query}"`, "Accounts Matched"]}
          defaultHidden={["Accounts Matched"]}
        >
          <>
            {blogs == null ? (
              <Loader />
            ) : blogs.results.length ? (
              blogs.results.map((blog, i) => {
                return (
                  <AnimationWrapper
                    transition={{
                      duration: 1,
                      delay: i * 0.1,
                    }}
                    key={i}
                  >
                    <BlogPostCard
                      content={blog}
                      author={blog.author.personal_info}
                    />
                  </AnimationWrapper>
                );
              })
            ) : (
              <NoDataMessage message="No blogs published" />
            )}
            <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlogs} />
          </>

          <UserCardWrapper />
        </InPageNavigation>
      </div>

      <div className="min-w-[25%]  lg:min-w-[400ox] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
        <div className="flex mb-6 border border-gray-400 focus-within:border-yellow-500 rounded-lg overflow-hidden group">
          <input
            type="text"
            placeholder="Search..."
            className="px-3 py-2 w-full transition-all duration-300 focus:w-[95%] focus:outline-none"
            onKeyDown={handleSearch}
          />
          <button
            className="bg-black text-white px-4 py-2 flex items-center justify-between w-[120px] 
    transition-all duration-300 group-focus-within:w-10 group-focus-within:justify-center 
    group-focus-within:bg-yellow-500 hover:!bg-yellow-500 gap-x-2 md:w-4/8"
            onClick={() => setSearchBoxVisibility((currentVal) => !currentVal)}
          >
            <span className="group-focus-within:hidden">SEARCH</span>
            <span className="text-yellow-500 group-hover:text-white">➝</span>
          </button>
        </div>

        {/* About Me Section */}
        <div className="relative w-full max-w-lg mx-auto ">
          {/* Hộp chứa tiêu đề với nền xám */}
          <div
            className="w-full py-3 px-6 inline-block relative mb-4 text-center"
            style={{ backgroundColor: "#e5e5e5" }} // Màu xám nhạt
          >
            <span
              className="text-black text-lg font-medium uppercase "
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "16px",
              }}
            >
              ABOUT ME
            </span>

            {/* Tam giác nhỏ phía dưới */}
            <div
              className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "8px solid #e5e5e5", // Màu xám nhạt giống phần trên
              }}
            ></div>
          </div>
          <img
            src={posts[0].imgSrc}
            alt={posts[0].title}
            className="rounded-lg mt-4 mx-auto w-full h-80 object-cover"
          />
          <h5 className="font-bold text-lg mt-4">Blogger & Youtuber</h5>
          <p className="text-sm mt-4 mb-12">
            Hi. Mình là Nam Anh. Chào mừng bạn đến với blog của mình...
          </p>
        </div>

        <div
          className="w-full py-3 px-6 inline-block relative mb-4 text-center"
          style={{ backgroundColor: "#e5e5e5" }} // Màu xám nhạt
        >
          <span
            className="text-black text-lg font-medium uppercase "
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "16px",
            }}
          >
            ARCHIVES
          </span>

          {/* Tam giác nhỏ phía dưới */}
          <div
            className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid #e5e5e5", // Màu xám nhạt giống phần trên
            }}
          ></div>
        </div>

        <div className="flex flex-col gap-2 mt-8">
          <ul className="list-none">
            {categories.map((temp, i) => {
              // console.log(temp);
              return (
                <li key={i} className="text-black text-xl font-serif mb-3">
                  <button
                    onClick={loadBlogByCategory} // Điều hướng về trang chủ
                    className={
                      "custom-hover capitalize  " +
                      (pageState == temp ? " btn-active " : " ")
                    }
                  >
                    {temp}
                  </button>
                  <span style={{ color: "#d3b062" }} className="custom-hover">
                    ({i + 1})
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default SearchPage;

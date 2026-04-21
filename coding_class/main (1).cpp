#include <iostream>
using namespace std;
int a[1100];
int main() {
	long long n,sum=0;
    cin>>n;
    for(long long i=1;i<=n;i++){
        cin>>a[i];
    }
    sum+=a[1];
    for(long long i=2;i<=n;i++){
    	if(a[i]>a[i-1]){
            sum+=a[i];
        }else{
            a[i]=a[i-1]+1;
         
            sum+=a[i];
        }
        //cout<<a[i]<<endl;
        
    }
           cout<<sum;
    return 0;
}